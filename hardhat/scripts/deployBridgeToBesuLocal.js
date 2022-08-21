const hre = require("hardhat");

async function main() {
  const BESU_LOCAL_EMV_TOKEN_ADDRESS = require('../tokenAddresses.json').BESU_LOCAL_EMV_TOKEN_ADDRESS;

  const Bridge = await hre.ethers.getContractFactory("Bridge");
  const bridge = await Bridge.deploy(BESU_LOCAL_EMV_TOKEN_ADDRESS);

  await bridge.deployed();

  console.log("Bridge contract deployed to:", bridge.address);

  const EVMtoken = await hre.ethers.getContractFactory("EVMtoken");
  const evmtoken = await EVMtoken.attach(BESU_LOCAL_EMV_TOKEN_ADDRESS);

  await evmtoken.transferOwnership(bridge.address);

  console.log("Ownership of EVM token transferred to:", bridge.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
