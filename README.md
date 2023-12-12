# SINICHAIN

## Lien de la démo : 

## Concept Général

SiniCHAIN est un outil de suivi de sinistre automobile à l'aide de la blockchain et des NFT. Le principe est de supprimer le papier et le processus très long que peut-être la déclaration de sinistre. Même si les e-Constats existent, il n'y a pas vraiment de suivi efficace. C'est pour ça que SiniCHAIN va répondre à ce besoin.

## Contrat Intelligent InsuranceSystem

- **Plateforme:** Ethereum.
- **Fonctionnalités Clés:**
  - Enregistrement des clients par l'assureur.
  - Création de NFTs pour les conducteurs, les voitures, les déclarations, et les bons.
  - Gestion des états des déclarations (création, envoi, traitement, validation/refus).
  - Gestion des bons d'assurance (création et envoi).

## Front-End

- **Framework:** React.
- **Fonctionnalités:**
  - Pages distinctes pour les rôles d'assureur et de client.
  - Interactions avec le contrat intelligent (ajout de clients, création de conducteurs/voitures/déclarations).
  - Affichage des informations récupérées du contrat intelligent.

## Interaction avec le Contrat

- **Utilisation de wagmi** pour interagir avec le contrat intelligent depuis le front.
- **Fonctionnalités** telles que l'ajout de clients uniquement si l'adresse qui le fait est celle qui a déployé le smart contract.

## Sécurité et Gestion

- **Utilisation des modificateurs de Solidity** pour gérer l'accès aux fonctions par les clients (onlyClient) qui sont les clients uniquement enregistrés par l'assureur.
- **Utilisation de Ownable** pour utiliser l'accès à l'owner uniquement sur certaines fonctions (onlyOwner).
- **Gestion des erreurs personnalisées** dans le contrat intelligent.

## Failles de sécurité

### Reentrancy

Mon contrat ne transfère pas directement d'ether ou n'interagit pas avec d'autres contrats de manière qui pourrait permettre cette faille. Les fonctions critiques comme ajouterConducteur, ajouterVoiture, etc., ne semblent donc pas exposées à cette faille. Cependant, si le projet vient à évoluer avec des systèmes de staking ou la création d'un token, un nouvel audit de sécurité devra être fait pour surveiller cette faille.

### DoS par erreur inattendue

Grâce à onlyClient, onlyOwner et les requires, cela permet de bloquer cette attaque. Seul l'assureur ou un client autorisé par l'assureur peut interagir avec le smart contract.

### DoS par limite de Gaz

Là encore, grâce aux require, onlyClient et onlyOwner, les utilisateurs seront contrôlés, ce n'est pas accessible à tout le monde et c'est l'assureur qui fait rentrer les clients.

### Force Feeding

Le contrat ne dépend pas directement d'un solde en ether, donc le risque est limité. Cependant, en cas d'évolution du projet, là encore cette attaque sera à surveiller.

## Autres points de considération

- **Génération de NFT :** Seul un client autorisé peut utiliser ces fonctions, mais un abus de création pourrait être effectué.
- **Vérification d'adresse :** Il faut une vérification poussée de l'assureur pour ne laisser rentrer aucun contrat malveillant qui pourrait boucler sur l'ajout de voiture ou déclaration.
- **Renforcement des autorisations des rôles :** À l'avenir, un contrôle renforcé notamment avec l'utilisation d'OpenZeppelin Access Control peut rajouter une sécurité supplémentaire.
- **Limite de performance et coût de gaz :** Tester la performance et surtout le coût en gaz si des boucles ou structures devaient s'ajouter.

## Déploiement et Tests

Le déploiement se fait sur Sépolia car nous avons trouvé pertinent l'utilisation de la blockchain Ethereum. Concernant les tests, j'ai testé tous les scénarios pertinents.

## Points Notables

- **Interaction entre le front-end et le contrat intelligent** pour une expérience utilisateur dynamique.
- **Utilisation de la norme ERC721 (NFTs)** pour représenter des éléments uniques comme les conducteurs, les voitures, etc
