const webpack = require('webpack');

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            $ENV: {
                BSC_TESTNET_NODE: JSON.stringify(process.env.BSC_TESTNET_NODE),
                GOERLI_TESTNET_NODE: JSON.stringify(process.env.GOERLI_TESTNET_NODE),
                BESU_LOCAL_NODE: JSON.stringify(process.env.BESU_LOCAL_NODE),
                BSC_BRIDGE_ADDRESS: JSON.stringify(process.env.BSC_BRIDGE_ADDRESS),
                GOERLI_BRIDGE_ADDRESS: JSON.stringify(process.env.GOERLI_BRIDGE_ADDRESS),
                BESU_BRIDGE_ADDRESS: JSON.stringify(process.env.BESU_BRIDGE_ADDRESS),
                BSC_EVM_TOKEN_ADDRESS: JSON.stringify(process.env.BSC_EVM_TOKEN_ADDRESS),
                GOERLI_EVM_TOKEN_ADDRESS: JSON.stringify(process.env.GOERLI_EVM_TOKEN_ADDRESS),
                BESU_EVM_TOKEN_ADDRESS: JSON.stringify(process.env.BESU_EVM_TOKEN_ADDRESS)
            }
        })
    ]
}
