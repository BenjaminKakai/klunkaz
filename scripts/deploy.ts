import { ethers } from "hardhat";

async function main() {
  try {
    console.log("Starting deployment...");
    
    const Klunkaz = await ethers.getContractFactory("Klunkaz");
    console.log("Contract factory created...");
    
    const klunkaz = await Klunkaz.deploy();
    console.log("Deploying Klunkaz...");
    
    await klunkaz.waitForDeployment();
    const address = await klunkaz.getAddress();
    
    console.log(`Klunkaz deployed to: ${address}`);
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });