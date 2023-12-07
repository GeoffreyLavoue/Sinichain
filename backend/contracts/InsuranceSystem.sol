 // SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Erreur personnalisé 
error handlingError(string message);

// Contrat principal du système d'assurance
contract InsuranceSystem is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // ::::::::::::: Structure de données ::::::::::::: //
    struct Client {
        bool isRegistered;
    }
    
    struct Conducteur {
        string nom;
        string adresse;
        string numeroPermis;
        string numeroTelephone;
        string email;
    }

    struct Voiture {
        string marque;
        string modele;
        string couleur;
        uint256 conducteurId;
    }

    struct Declaration {
        uint256 conducteurId;
        uint256 voitureId;
        string details;
    }

    struct Bon {
        string details;
        bool estValide;
    }

    // ::::::::::::: Enumération des différents états possibles ::::::::::::: //

    enum  WorkflowStatus {
        EnregistrementClient,
        ClientEnregistre,
        ConducteurCree,
        VehiculeCree,
        DeclarationCree,
        DeclarationEnvoyee,
        EnCoursDeTraitement,
        Valide,
        Refuse,
        BonEnvoye
    }

    WorkflowStatus public workflowStatus;
    
    // Mappinps pour stocker les informations
    mapping (address => Client) client;
    mapping(address => uint256) private clientToConducteurId;
    mapping(address => bool) private aCreeConducteur;
    mapping(uint256 => Conducteur) private conducteurs;
    mapping(uint256 => Voiture) private voitures;
    mapping(uint256 => Declaration) private declarations;
    mapping(uint256 => Bon) private bons;

    // Événements pour notifier les changements d'état
    event ClientRegistered(address clientAddress);
    event ConducteurAdded(uint256 conducteurId);
    event VoitureAdded(uint256 voitureId);
    event DeclarationAdded(uint256 declarationId);
    event BonAdded(uint256 bonId);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    // Constructeur pour initialiser le contrat
    constructor() ERC721("InsuranceNFT", "INS") Ownable() {}

    // Modifier pour limiter l'accès aux clients enregistrés
    modifier onlyClient() {
        if(!client[msg.sender].isRegistered) revert handlingError("You're not a Driver");
        else {
            _;
        }
    }

    // ::::::::::::: AJout ::::::::::::: //

    // Fonction pour que l'assureur puisse enregistré un client
    function addClient(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.EnregistrementClient, "Etape non autorisee pour ajouter un conducteur");
        if (client[_addr].isRegistered == true) {
            revert handlingError('Already registered');
        } else {
            client[_addr].isRegistered = true;
            emit ClientRegistered(_addr);
            workflowStatus = WorkflowStatus.ClientEnregistre;
            emit WorkflowStatusChange(WorkflowStatus.EnregistrementClient, WorkflowStatus.ClientEnregistre);
        }
    }

    // Function pour ajouter et créer un NFT de Conducteur 
    function ajouterConducteur(string memory nom, string memory adresse, string memory numeroPermis, string memory numeroTelephone, string memory email) public onlyClient {
        require(workflowStatus == WorkflowStatus.ClientEnregistre, "Etape non autorisee pour ajouter un conducteur");
        require(!aCreeConducteur[msg.sender], "Client a deja cree un conducteur");
        _tokenIds.increment();
        uint256 newConducteurId = _tokenIds.current();
        conducteurs[newConducteurId] = Conducteur(nom, adresse, numeroPermis, numeroTelephone, email);
        emit ConducteurAdded(newConducteurId);
        aCreeConducteur[msg.sender] = true;
        clientToConducteurId[msg.sender] = newConducteurId;
        _mint(msg.sender, newConducteurId);
        emit DeclarationAdded(newConducteurId);
        workflowStatus = WorkflowStatus.ConducteurCree;
        emit WorkflowStatusChange(WorkflowStatus.ClientEnregistre, WorkflowStatus.ConducteurCree);
    }

    // Function pour ajouter et créer un NFT de voiture
    function ajouterVoiture(uint256 conducteurId, string memory marque, string memory modele, string memory couleur) public onlyClient {
        require(workflowStatus == WorkflowStatus.ConducteurCree, "Etape non autorisee pour ajouter une voiture");
        require(conducteurId != 0, "ConducteurId invalide");
        require(bytes(conducteurs[conducteurId].numeroPermis).length > 0, "Conducteur non enregistre");
        _tokenIds.increment();
        uint256 newVoitureId = _tokenIds.current();
        voitures[newVoitureId] = Voiture(marque, modele, couleur, conducteurId);
        _mint(msg.sender, newVoitureId);
        emit VoitureAdded(newVoitureId);
        workflowStatus = WorkflowStatus.VehiculeCree;
        emit WorkflowStatusChange(WorkflowStatus.ConducteurCree, WorkflowStatus.VehiculeCree);
   
    }

    // Function pour ajouter et créer un NFT de déclaration
    function ajouterDeclaration(uint256 conducteurId, uint256 voitureId, string memory details) public onlyClient {
        require(workflowStatus == WorkflowStatus.VehiculeCree, "Etape non autorisee pour ajouter une declaration");
        require(aCreeConducteur[msg.sender], "Le client n'est pas enregistre en tant que conducteur");
        require(conducteurId != 0 && conducteurId <= _tokenIds.current(), "Conducteur inconnu");
        require(bytes(conducteurs[conducteurId].numeroPermis).length > 0, "Conducteur non enregistre");
        require(voitureId != 0 && voitureId <= _tokenIds.current(), "Voiture inconnue");
        require(voitures[voitureId].conducteurId == conducteurId, "Cette voiture n'appartient pas au conducteur");
        _tokenIds.increment();
        uint256 newDeclarationId = _tokenIds.current();
        declarations[newDeclarationId] = Declaration(conducteurId, voitureId, details);
        _mint(msg.sender, newDeclarationId);
        emit DeclarationAdded(newDeclarationId);
        workflowStatus = WorkflowStatus.DeclarationCree;
        emit WorkflowStatusChange(WorkflowStatus.VehiculeCree, WorkflowStatus.DeclarationCree);
    }

    // Function pour ajouter et créer un NFT de bon
    function creerBon(string memory details, bool estValide) public onlyOwner returns (uint256) {
        require(workflowStatus == WorkflowStatus.DeclarationEnvoyee, "Etape non autorisee pour creer un bon");
        _tokenIds.increment();
        uint256 newBonId = _tokenIds.current();
        bons[newBonId] = Bon(details, estValide);
        _mint(msg.sender, newBonId);
        emit BonAdded(newBonId);
        if (estValide) {
            workflowStatus = WorkflowStatus.Valide;
            emit WorkflowStatusChange(WorkflowStatus.DeclarationCree, WorkflowStatus.Valide);
        } else {
            workflowStatus = WorkflowStatus.Refuse;
            emit WorkflowStatusChange(WorkflowStatus.DeclarationCree, WorkflowStatus.Refuse);
        }
        return newBonId;
    }

    // ::::::::::::: GETTERS ::::::::::::: //


    function getClient(address _addr) public view onlyOwner returns (bool) {
        return client[_addr].isRegistered;
    }

    function getConducteur(uint256 conducteurId) public view returns (string memory, string memory, string memory, string memory, string memory) {
        require(ownerOf(conducteurId) == msg.sender, "Seul le proprietaire de la declaration peut la voire");
        Conducteur memory conducteur = conducteurs[conducteurId];
        return (conducteur.nom, conducteur.adresse, conducteur.numeroPermis, conducteur.numeroTelephone, conducteur.email);
    }

    function getVoiture(uint256 voitureId) public view returns (string memory marque, string memory modele, string memory couleur, Conducteur memory detailsConducteur) {
        require(ownerOf(voitureId) == msg.sender, "Seul le proprietaire de la declaration peut la voire");
        Voiture memory voiture = voitures[voitureId];
        Conducteur memory conducteur = conducteurs[voiture.conducteurId];
        Conducteur memory details = Conducteur({
            nom: conducteur.nom,
            adresse: conducteur.adresse,
            numeroPermis: conducteur.numeroPermis,
            numeroTelephone: conducteur.numeroTelephone,
            email: conducteur.email
        });
        return (voiture.marque, voiture.modele, voiture.couleur, details);
    }

    function getDeclaration(uint256 declarationId) public view returns (
        uint256 conducteurId, 
        string memory nomConducteur, 
        string memory adresseConducteur, 
        string memory numeroPermisConducteur, 
        string memory numeroTelephoneConducteur, 
        string memory emailConducteur, 
        uint256 voitureId, 
        string memory marqueVoiture, 
        string memory modeleVoiture, 
        string memory couleurVoiture, 
        string memory detailsDeclaration
    ) {
        require(ownerOf(declarationId) == msg.sender, "Seul le proprietaire de la declaration peut la voire");
        Declaration memory declaration = declarations[declarationId];
        Conducteur memory conducteur = conducteurs[declaration.conducteurId];
        Voiture memory voiture = voitures[declaration.voitureId];
        return (
            declaration.conducteurId,
            conducteur.nom, 
            conducteur.adresse, 
            conducteur.numeroPermis, 
            conducteur.numeroTelephone, 
            conducteur.email,
            declaration.voitureId,
            voiture.marque, 
            voiture.modele, 
            voiture.couleur,
            declaration.details
        );
    }


    function getBon(uint256 bonId) public view returns (string memory, bool) {
        require(ownerOf(bonId) == msg.sender, "Seul le proprietaire de la declaration peut la voire");
        Bon memory bon = bons[bonId];
        return (bon.details, bon.estValide);
    }

    // ::::::::::::: Envoie ::::::::::::: //

    function EnvoyerDeclaration(uint256 declarationId) public onlyClient {
        require(workflowStatus == WorkflowStatus.DeclarationCree, "Etape non autorisee pour ajouter un conducteur");
        require(ownerOf(declarationId) == msg.sender, "Seul le proprietaire de la declaration peut l'envoyer");
        safeTransferFrom(msg.sender, owner(), declarationId);
        workflowStatus = WorkflowStatus.DeclarationEnvoyee;
        emit WorkflowStatusChange(WorkflowStatus.DeclarationCree, WorkflowStatus.DeclarationEnvoyee);
        
    }

    function envoyerBon(uint256 bonId, address clientAddress) public onlyOwner {
        require(workflowStatus == WorkflowStatus.Valide || workflowStatus == WorkflowStatus.Refuse, "Etape non autorisee pour envoyer un bon");
        require(ownerOf(bonId) == msg.sender, "Le bon doit etre en possession de l'assureur");
        safeTransferFrom(msg.sender, clientAddress, bonId);
        if (workflowStatus == WorkflowStatus.Valide) {
            workflowStatus = WorkflowStatus.BonEnvoye;
            emit WorkflowStatusChange(WorkflowStatus.Valide, WorkflowStatus.BonEnvoye);
        } else {

            if (workflowStatus == WorkflowStatus.Refuse) {
            workflowStatus = WorkflowStatus.BonEnvoye;
            emit WorkflowStatusChange(WorkflowStatus.Refuse, WorkflowStatus.BonEnvoye);
        }

        }
    }
    
}
