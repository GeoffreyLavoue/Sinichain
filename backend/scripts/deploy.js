const hre = require("hardhat");

async function main() {
  // Déployer ConducteurNFT
  const assurance = await hre.ethers.deployContract("InsuranceSystem");
  await assurance.waitForDeployment(); // Correction ici
  console.log(`Assurance deployed to ${assurance.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});