import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🪙 Deploying $VERI Token to Polygon Mainnet...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("📍 Deploying from address:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("⚠️  Insufficient balance. Need at least 0.01 MATIC for deployment.");
  }

  // Deploy VeriToken
  console.log("\n📝 Deploying VeriToken contract...");
  const TokenFactory = await ethers.getContractFactory("VeriToken");
  const token = await TokenFactory.deploy();

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("✅ VeriToken deployed to:", tokenAddress);

  // Get token info
  const name = await token.name();
  const symbol = await token.symbol();
  const totalSupply = await token.totalSupply();
  const decimals = await token.decimals();

  console.log("\n📊 Token Details:");
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Decimals:", decimals);
  console.log("  Total Supply:", ethers.formatEther(totalSupply), symbol);
  console.log("  Owner:", deployer.address);

  // Wait for confirmations
  console.log("\n⏳ Waiting for 5 block confirmations...");
  const deploymentTx = token.deploymentTransaction();
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
    token: {
      address: tokenAddress,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: totalSupply.toString(),
    },
    transactionHash: deploymentTx?.hash,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "veri-token.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📄 Deployment info saved to:", deploymentFile);

  // Verification instructions
  console.log("\n🔍 To verify on Polygonscan, run:");
  console.log(`npx hardhat verify --network polygon ${tokenAddress}`);

  console.log("\n✨ Token deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
