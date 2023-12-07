// scripts/addClient.js
const hre = require("hardhat");

async function main() {
    // Obtenir les contrats déployés
    const InsuranceSystem = await hre.ethers.getContractFactory("InsuranceSystem");
    const insuranceSystem = await InsuranceSystem.attach("0x96F171F334251605D792457F86F70894DB23b2eB");

    // Appel de la fonction addClient
    const tx = await insuranceSystem.addClient("0xB9d95b069e0a9465AdE80F943074e6f2898F6356");
    await tx.wait();

    console.log("Client ajouté avec succès");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
