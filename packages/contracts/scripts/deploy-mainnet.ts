import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying StatusList2021Registry to Polygon Mainnet...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("📍 Deploying from address:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("⚠️  Insufficient balance. Need at least 0.01 MATIC for deployment.");
  }

  // Deploy StatusList2021Registry
  console.log("\n📝 Deploying StatusList2021Registry contract...");
  const RegistryFactory = await ethers.getContractFactory("StatusList2021Registry");
  const registry = await RegistryFactory.deploy();

  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();

  console.log("✅ StatusList2021Registry deployed to:", registryAddress);

  // Wait for a few block confirmations
  console.log("\n⏳ Waiting for 5 block confirmations...");
  const deploymentTx = registry.deploymentTransaction();
  if (deploymentTx) {
    await deploymentTx.wait(5);
    console.log("✅ Confirmed!");
  }

  // Save deployment info
  const deploymentInfo = {
    network: "polygon",
    chainId: 137,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      StatusList2021Registry: registryAddress,
    },
    transactionHash: deploymentTx?.hash,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "mainnet.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📄 Deployment info saved to:", deploymentFile);

  // Verification instructions
  console.log("\n🔍 To verify on Polygonscan, run:");
  console.log(`npx hardhat verify --network polygon ${registryAddress}`);

  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
