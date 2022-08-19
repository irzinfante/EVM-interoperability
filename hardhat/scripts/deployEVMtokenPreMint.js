const hre = require("hardhat");

async function main() {
  const EVMtoken = await hre.ethers.getContractFactory("EVMtoken");
  const evmtoken = await EVMtoken.deploy(10000000);

  await evmtoken.deployed();

  console.log("A token for interoperability deployed to:", evmtoken.address);
  console.log("Preminted 10,000,000 EVM tokens");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
