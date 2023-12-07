// pages/documentation.js
import Image from 'next/image';
import Head from 'next/head';
import styles from '../page.module.css'; // Utilisation du CSS existant
import Link from 'next/link';

export default function Documentation() {
  return (
    <>
      <Head>
        <title>Documentation - Sinichain</title>
      </Head>
      <Link href="/">
        <a className={styles.homeButton}>Home</a> {/* Bouton Home */}
      </Link>

      <div className={styles.container}>
        <header className={styles.center}>
          <Image
            src="/titre.png"
            alt="Logo Sinichain"
            width={50}
            height={50}
          />
          <h1>Documentation</h1>
        </header>

        <main className={styles.main}>
          <section className={styles.card}>
            <h2>Litepaper</h2>
            <p>Ce litepaper présente une vue d'ensemble de SiniChain, sa vision, sa mission et ses caractéristiques clés. [Contenu du litepaper à ajouter]</p>
          </section>

          <section className={styles.card}>
            <h2>Smart Contracts</h2>
            <div className={styles.code}>
              <pre>
                {`
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error handlingError(string message);

// Merged contract that combines the functionalities of Assureur, BonNFT, Client, ConducteurNFT, DeclarationNFT, and VoitureNFT
contract InsuranceSystem is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Define structures for Conducteur, Voiture, and Declaration
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
    
    mapping (address => Client) client;
    mapping(address => uint256) private clientToConducteurId;
    mapping(address => bool) private aCreeConducteur;



    // Mappings for Conducteurs, Voitures, Declarations, and Bons
    mapping(uint256 => Conducteur) private conducteurs;
    mapping(uint256 => Voiture) private voitures;
    mapping(uint256 => Declaration) private declarations;
    mapping(uint256 => Bon) private bons;

    // Events
    event ClientRegistered(address clientAddress);
    event ConducteurAdded(uint256 conducteurId);
    event VoitureAdded(uint256 voitureId);
    event DeclarationAdded(uint256 declarationId);
    event BonAdded(uint256 bonId);


    constructor() ERC721("InsuranceNFT", "INS") Ownable() {
        workflowStatus = WorkflowStatus.EnregistrementClient;
    }

    modifier onlyClient() {
        if(!client[msg.sender].isRegistered) revert handlingError("You're not a Driver");
        else {
            _;
        }
    }

    // ::::::::::::: AJout ::::::::::::: //

    // Function to add a Conducteur
    function ajouterConducteur(string memory nom, string memory adresse, string memory numeroPermis, string memory numeroTelephone, string memory email) public onlyClient {
       
        //Require
        require(workflowStatus == WorkflowStatus.ClientEnregistre, "Etape non autorisee pour ajouter un conducteur");
        require(!aCreeConducteur[msg.sender], "Client a deja cree un conducteur");
        
        // Création Conducteur et NFT
        _tokenIds.increment();
        uint256 newConducteurId = _tokenIds.current();
        conducteurs[newConducteurId] = Conducteur(nom, adresse, numeroPermis, numeroTelephone, email);
        emit ConducteurAdded(newConducteurId);
        aCreeConducteur[msg.sender] = true;
        clientToConducteurId[msg.sender] = newConducteurId;
        _mint(msg.sender, newConducteurId);
        emit DeclarationAdded(newConducteurId);

        
        // Changement de status
        workflowStatus = WorkflowStatus.ConducteurCree;
    }

    // Function to add a Voiture
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
   
    }

    // Function to add a Declaration
    function ajouterDeclaration(uint256 conducteurId, uint256 voitureId, string memory details) public onlyClient {
        // Vérifier si le client est enregistré en tant que conducteur
        require(workflowStatus == WorkflowStatus.VehiculeCree, "Etape non autorisee pour ajouter une declaration");
        require(aCreeConducteur[msg.sender], "Le client n'est pas enregistre en tant que conducteur");

        // Vérifier si le conducteurId est valide
        require(conducteurId != 0 && conducteurId <= _tokenIds.current(), "Conducteur inconnu");
        require(bytes(conducteurs[conducteurId].numeroPermis).length > 0, "Conducteur non enregistre");

        // Vérifier si le conducteur a une voiture
        require(voitureId != 0 && voitureId <= _tokenIds.current(), "Voiture inconnue");
        require(voitures[voitureId].conducteurId == conducteurId, "Cette voiture n'appartient pas au conducteur");

        _tokenIds.increment();
        uint256 newDeclarationId = _tokenIds.current();
        declarations[newDeclarationId] = Declaration(conducteurId, voitureId, details);
        _mint(msg.sender, newDeclarationId);
        emit DeclarationAdded(newDeclarationId);
        
        workflowStatus = WorkflowStatus.DeclarationCree;
    }

    // Function to add a Bon
    function creerBon(string memory details, bool estValide) public onlyOwner returns (uint256) {
        require(workflowStatus == WorkflowStatus.DeclarationEnvoyee, "Etape non autorisee pour creer un bon");

        _tokenIds.increment();
        uint256 newBonId = _tokenIds.current();
        bons[newBonId] = Bon(details, estValide);
        _mint(msg.sender, newBonId);
        emit BonAdded(newBonId);

        // Mise à jour du workflowStatus en fonction de estValide
        if (estValide) {
            workflowStatus = WorkflowStatus.Valide;
        } else {
            workflowStatus = WorkflowStatus.Refuse;
        }
        
        return newBonId;
    }

    function addClient(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.EnregistrementClient, "Etape non autorisee pour ajouter un conducteur");
        
        if (client[_addr].isRegistered == true) {
            revert handlingError('Already registered');
        } else {
            client[_addr].isRegistered = true;
            emit ClientRegistered(_addr);
            
            // Mettre à jour le statut après l'enregistrement réussi du conducteur
            workflowStatus = WorkflowStatus.ClientEnregistre;
        }
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
        // Mettre à jour le statut de la déclaration si nécessaire
    }

    function envoyerBon(uint256 bonId, address clientAddress) public onlyOwner {
        require(workflowStatus == WorkflowStatus.Valide || workflowStatus == WorkflowStatus.Refuse, "Etape non autorisee pour envoyer un bon");
        require(ownerOf(bonId) == msg.sender, "Le bon doit etre en possession de l'assureur");

        safeTransferFrom(msg.sender, clientAddress, bonId);

        // Mise à jour du workflowStatus après l'envoi du bon
        if (workflowStatus == WorkflowStatus.Valide) {
            workflowStatus = WorkflowStatus.BonEnvoye;
        } else {

            if (workflowStatus == WorkflowStatus.Refuse) {
            workflowStatus = WorkflowStatus.BonEnvoye;
        }

        }
        // Vous pouvez ajouter d'autres logiques si nécessaire
    }

    // Additional functions and logic can be added as needed

    // ::::::::::::: State ::::::::::::: //

    
}
`}
              </pre>
            </div>
          </section>

          <section className={styles.card}>
            <h2>Roadmap</h2>
            <p>"Roadmap Sinichain
Mars 2024 : Lancement du Token SNC
Développement et déploiement du token SNC sur la blockchain.
Mise en place d'un système d'échange et de trading pour le token.
Intégration du token SNC dans la plateforme Sinichain pour les paiements et récompenses.
Juin 2024 : Mise en Place de la Plateforme d'Assurance
Lancement officiel de la plateforme d'assurance Sinichain.
Intégration des fonctionnalités de gestion de polices d'assurance.
Début des opérations avec les premiers clients et partenaires.
Août 2024 : Lancement du Staking de NFT
Introduction du staking de NFT sur la plateforme.
Les utilisateurs peuvent staker leurs NFTs d'assurance pour obtenir des récompenses en token SNC.
Développement d'un système de récompenses basé sur la fidélité et l'engagement des utilisateurs.
Octobre 2024 : Partenariats Stratégiques et Expansion
Établissement de partenariats avec d'autres acteurs de l'industrie de l'assurance et de la blockchain.
Expansion des services Sinichain à d'autres marchés et régions.
Amélioration continue de la plateforme basée sur les retours des utilisateurs.
Décembre 2024 : Introduction de Fonctionnalités d'IA
Intégration de l'intelligence artificielle pour améliorer l'analyse des risques et la personnalisation des polices d'assurance.
Développement d'outils prédictifs pour une meilleure gestion des réclamations et une réduction des fraudes.
Février 2025 : Programme de Fidélité et Récompenses
Lancement d'un programme de fidélité innovant basé sur les tokens SNC.
Récompenses accrues pour les utilisateurs les plus actifs et les plus fidèles sur la plateforme.
Avril 2025 : Mise en Place d'une Marketplace d'Assurance
Création d'une marketplace où les utilisateurs peuvent acheter, vendre ou échanger des polices d'assurance sous forme de NFT.
Intégration de fonctionnalités de cotation et de comparaison d'offres d'assurance.
Juin 2025 : Améliorations Technologiques et Mises à Jour
Mise en œuvre de mises à jour technologiques pour renforcer la sécurité et l'efficacité de la plateforme.
Introduction de nouvelles fonctionnalités basées sur les dernières avancées en matière de blockchain et de fintech."</p>
          </section>
        </main>
      </div>
    </>
  );

}
