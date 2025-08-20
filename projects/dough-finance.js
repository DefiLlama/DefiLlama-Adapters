const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens2 } = require("./helper/unwrapLPs")

async function getVaults(api) {
    const vaults = await api.fetchList({ lengthAbi: 'dsaCounter', itemAbi: 'getDsaByID', target: "0x5390724ca3b0880242c7b1ef08eb9b1abe698c0e" })
    const tokens = [
        "0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c", 
        "0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8",
        ADDRESSES.ethereum.USDC, // usdc
        ADDRESSES.ethereum.WETH, // eth
        "0x72e95b8931767c79ba4eee721354d6e99a61d004", // debt usdc
        "0xea51d7853eefb32b6ee06b1c12e6dcca88be0ffe", // debt weth
    ]
    return { vaults, tokens }
}

module.exports = {
    // hallmarks: [
    //     [1720742400, "Protocol Exploit"]
    // ],
    ethereum: {
        tvl: async (api) => {
            const { vaults, tokens } = await getVaults(api)
            return sumTokens2({ api, tokens, owners: vaults })
        },
    }
}
