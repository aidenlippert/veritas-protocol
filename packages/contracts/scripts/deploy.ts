import { ethers } from "hardhat";

async function main() {
  console.log("Deploying StatusList2021Registry...");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} MATIC`);

  // Deploy the registry
  const RegistryFactory = await ethers.getContractFactory("StatusList2021Registry");
  const registry = await RegistryFactory.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log(`\n✅ StatusList2021Registry deployed to: ${address}`);
  console.log(`\nAdd this to your .env file:`);
  console.log(`REVOCATION_REGISTRY_ADDRESS=${address}`);

  // Verify on Polygonscan (if on testnet/mainnet)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log(`\nWaiting for block confirmations...`);
    await registry.deploymentTransaction()?.wait(6);

    console.log(`\nVerifying contract on Polygonscan...`);
    console.log(`Run: npx hardhat verify --network ${network.name} ${address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
