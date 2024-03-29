const hre = require("hardhat");

async function main() {
  const EVMtoken = await hre.ethers.getContractFactory("EVMtoken");
  const evmtoken = await EVMtoken.deploy(0);

  await evmtoken.deployed();

  console.log("A token for interoperability deployed to:", evmtoken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
