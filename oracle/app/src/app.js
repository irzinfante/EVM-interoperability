const { ethers } = require("ethers");
const BRIDGE_ABI = require('./abis/Bridge.json');
const DERIVATION_PATH = "m/44'/60'/0'/0/1";
const BSC_TESTNET_NETWORK_ID = "97";
const GOERLI_TESTNET_NETWORK_ID = "5";
const BESU_LOCAL_NETWORK_ID = "657665";

function getContract(wsProviderUrl, bridgeAddress) {
    wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC, DERIVATION_PATH);
    wallet = wallet.connect(new ethers.providers.WebSocketProvider(wsProviderUrl));
    return new ethers.Contract(bridgeAddress, BRIDGE_ABI, wallet);
}

async function main() {
    let bscTestnetBridge = getContract(process.env.BSC_TESTNET_NODE, process.env.BSC_BRIDGE_ADDRESS);
    let goerliTestnetBridge = getContract(process.env.GOERLI_TESTNET_NODE, process.env.GOERLI_BRIDGE_ADDRESS);
    let besuLocalBridge = getContract(process.env.BESU_LOCAL_NODE, process.env.BESU_BRIDGE_ADDRESS);

    bscTestnetBridge.on("Deposit", async (address, amount, chainId) => {
        let tx;
        switch (chainId.toString()) {
            case GOERLI_TESTNET_NETWORK_ID:
                tx = await goerliTestnetBridge.mintTokens(address, amount, {gasPrice: ethers.utils.parseUnits('1', 'gwei')});
                tx = await tx.wait();
                console.log("Göerli_testnet mintTokens", tx.transactionHash);
                break;
            case BESU_LOCAL_NETWORK_ID:
                tx = await besuLocalBridge.mintTokens(address, amount, {gasPrice: ethers.utils.parseUnits('1000000', 'wei')});
                tx = await tx.wait();
                console.log("Besu_local mintTokens", tx.transactionHash);
                break;
            default:
                break;
        }
    });

    goerliTestnetBridge.on("Burn", async (address, amount, chainId) => {
        let tx;
        switch (chainId.toString()) {
            case BSC_TESTNET_NETWORK_ID:
                tx = await bscTestnetBridge.withdrawTokens(address, amount, {gasPrice: ethers.utils.parseUnits('1', 'gwei')});
                tx = await tx.wait();
                console.log("BSC_testnet withdrawTokens", tx.transactionHash);
                break;
            case BESU_LOCAL_NETWORK_ID:
                tx = await besuLocalBridge.mintTokens(address, amount, {gasPrice: ethers.utils.parseUnits('1000000', 'wei')});
                tx = await tx.wait();
                console.log("Besu_local mintTokens", tx.transactionHash);
                break;
            default:
                break;
        }
    });

    besuLocalBridge.on("Burn", async (address, amount, chainId) => {
        let tx;
        switch (chainId.toString()) {
            case BSC_TESTNET_NETWORK_ID:
                tx = await bscTestnetBridge.withdrawTokens(address, amount, {gasPrice: ethers.utils.parseUnits('1', 'gwei')});
                tx = await tx.wait();
                console.log("BSC_testnet withdrawTokens", tx.transactionHash);
                break;
            case GOERLI_TESTNET_NETWORK_ID:
                tx = await goerliTestnetBridge.mintTokens(address, amount, {gasPrice: ethers.utils.parseUnits('1', 'gwei')});
                tx = await tx.wait();
                console.log("Göerli_testnet mintTokens", tx.transactionHash);
                break;
            default:
                break;
        }
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


