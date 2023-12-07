const { expect } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert } = require('@openzeppelin/test-helpers');

describe("InsuranceSystem Contract", function () {
    let InsuranceSystem;
    let insuranceContract;
    let owner;
    let client1;
    let client2;
    let accounts;

    before(async function () {
        InsuranceSystem = await ethers.deployContract("InsuranceSystem");
        [owner, client1, client2, ...accounts] = await ethers.getSigners();
        insuranceContract = await InsuranceSystem.waitForDeployment();
    });
    describe("Déploiement", function () {
        it("Définition du bon propriétaire", async function () {
            expect(await insuranceContract.owner()).to.equal(owner.address);
        });

        it("Initialisation du bon WorkFlowStatus", async function () {
            expect(await insuranceContract.workflowStatus()).to.equal(0); 
        });
    });

    describe("Gestion des conducteurs", function () {
        it("L'assureur doit pouvoir ajouter un nouveau client", async function () {
            await insuranceContract.addClient(client1.address);
            const client = await insuranceContract.getClient(client1.address);
            expect(client).to.be.true;
        });

        it("Doit permettre à un client enregistré d'ajouter un conducteur", async function () {
            await insuranceContract.connect(client1).ajouterConducteur("John Doe", "123 Main St", "PERMIS123", "1234567890", "john@example.com");
        });

        it("Doit échouer pour les clients non enregistrés", async function () {
          await expectRevert(insuranceContract.connect(accounts[0]).ajouterConducteur("Jane Doe", "123 Main St", "PERMIS124", "0987654321", "jane@example.com"), "You're not a Driver");
        });
      });
    describe("Gestion des voitures", function () {

        it("Doit retourner une erreur si le mauvais Id de conducteur est rentré", async function () {
          await expectRevert(insuranceContract.connect(client1).ajouterVoiture(10, "Tesla", "Model X", "Blue"),"Conducteur non enregistre");
        });
        it("Doit permettre à un client enregistré d'ajouter une voiture", async function () {
            await insuranceContract.connect(client1).ajouterVoiture(1, "Tesla", "Model S", "Red");
        });

        it("Doit échouer si le client essaie d'ajouter une voiture sans être enregistré", async function () {
            await expectRevert(insuranceContract.connect(accounts[0]).ajouterVoiture(1, "Tesla", "Model X", "Blue"),"You're not a Driver");
        });

    });

    describe("Gestion des déclarations", function () {
        it("Doit retourner une erreur si le Client renseigne un véhicule non existant", async function () {
          await expect(insuranceContract.connect(client1).ajouterDeclaration(1, 999, "Accident at Main St")).to.be.revertedWith("Voiture inconnue");
        });
    

        it("Doit permettre à un client enregistré d'ajouter une déclaration", async function () {
            await expect(insuranceContract.connect(client1).ajouterDeclaration(1, 2, "Another accident"));
        });
    });

    describe("Envoi de déclarations", function () {
      it("Doit permettre à un client enregistré d'envoyer une déclaration", async function () {
          await insuranceContract.connect(client1).EnvoyerDeclaration(3);
          expect(await insuranceContract.workflowStatus()).to.equal(5);
      });
  
      it("Doit échouer si un client non propriétaire essaie d'envoyer une déclaration", async function () {
          await expect(insuranceContract.connect(client2).EnvoyerDeclaration(3), "Seul le proprietaire de la declaration peut l'envoyer");
      });
  
      it("Doit échouer si le WorkflowStatus n'est pas DéclarationCréée", async function () {
          await expect(insuranceContract.connect(client1).EnvoyerDeclaration(3))
              .to.be.revertedWith("Etape non autorisee pour ajouter un conducteur");
      });
  });
  

    describe("Gestion des Bons", function () {
        it("L'assureur peut créer un bon", async function () {
            await insuranceContract.connect(owner).creerBon("Bon for repairs", true);
        });
    });

    describe("Envoi des Bons", function () {
      
      it("Doit échouer si un non-propriétaire essaie d'envoyer un bon", async function () {
        await expect(insuranceContract.connect(client2).envoyerBon(4, client1.address))
            .to.be.revertedWith("Ownable: caller is not the owner");
      });
      
      it("Doit permettre au propriétaire d'envoyer un bon", async function () {
          await expect(insuranceContract.envoyerBon(4, client1.address))
              .to.emit(insuranceContract, "Transfer")
              .withArgs(owner.address, client1.address, 4);
      });

      it("Doit échouer si le WorkflowStatus n'est pas approprié", async function () {
          // Assurez-vous que le workflowStatus n'est pas Valide ou Refuse
          await expect(insuranceContract.envoyerBon(4, client1.address))
              .to.be.revertedWith("Etape non autorisee pour envoyer un bon");
      });


      /*it("Should revert if the bon does not belong to the insurer", async function () {
        // Assurez-vous que le bon appartient à l'assureur
        await insuranceContract.transferFrom(owner.address, client1.address, 4);
    
        // Tenter d'envoyer le bon par l'assureur alors qu'il appartient à client1
        await expect(insuranceContract.connect(owner).envoyerBon(4, client2.address))
            .to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
      });*/
    
    
    
  });

});
