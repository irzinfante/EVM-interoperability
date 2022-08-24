require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const {
  MNEMONIC,
  BESU_LOCAL_URL,
  BESU_LOCAL_ID,
  ETHEREUM_GOERLI_URL,
  BSC_TESTNET_URL,
  BSCSCAN_API_KEY,
  ETHERSCAN_API_KEY
} = process.env;

const ACCOUNTS = {
  mnemonic: MNEMONIC,
  path: "m/44'/60'/0'/0",
  initialIndex: 1,
  count: 1,
  passphrase: ""
};

module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "constantinople"
    }
  },
  networks: {
    besu_local: {
      url: BESU_LOCAL_URL,
      gasPrice: 1000000,
      accounts: ACCOUNTS
    },
    ethereum_goerli: {
      url: ETHEREUM_GOERLI_URL,
      gasPrice: 1000000000,
      accounts: ACCOUNTS
    },
    bsc_testnet: {
      url: BSC_TESTNET_URL,
      gasPrice: 1000000000,
      accounts: ACCOUNTS
    }
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
      bscTestnet: BSCSCAN_API_KEY
    }
  },
  mocha: {
    timeout: 0
  }
};
