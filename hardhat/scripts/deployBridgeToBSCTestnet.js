const hre = require("hardhat");

async function main() {
  const BSC_TESTNET_EMV_TOKEN_ADDRESS = require('../tokenAddresses.json').BSC_TESTNET_EMV_TOKEN_ADDRESS;

  const Bridge = await hre.ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy(BSC_TESTNET_EMV_TOKEN_ADDRESS);

  await bridge.deployed();

  console.log("Bridge contract deployed to:", bridge.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
