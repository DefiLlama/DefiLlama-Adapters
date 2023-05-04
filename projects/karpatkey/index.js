const { sumTokensExport } = require("../helper/unwrapLPs");

const GNO_TOKEN_CONTRACT_ETH  = '0x6810e776880c02933d47db1b9fc05908e5386b96'
const GNO_TOKEN_CONTRACT_XDAI = '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb'

const WALLET_ETH_39d = '0x849d52316331967b6ff1198e5e32a0eb168d039d'
const WALLET_ETH_462 = '0x4971dd016127f390a3ef6b956ff944d0e2e1e462'

const WALLET_XDAI_e6f = '0x458cd345b4c05e8df39d0a07220feb4ec19f5e6f'
const WALLET_XDAI_969 = '0x10e4597ff93cbee194f4879f8f1d54a370db6969'


module.exports = {
    ethereum: {
        tvl: sumTokensExport({
                tokensAndOwners: [
                    [GNO_TOKEN_CONTRACT_ETH, WALLET_ETH_39d],
                    [GNO_TOKEN_CONTRACT_ETH, WALLET_ETH_462],
                ],
        }),
    },
    xdai: {
        tvl: sumTokensExport({
                tokensAndOwners: [
                    [GNO_TOKEN_CONTRACT_XDAI, WALLET_XDAI_e6f],
                    [GNO_TOKEN_CONTRACT_XDAI, WALLET_XDAI_969],
                ],
        }),
    }

};
