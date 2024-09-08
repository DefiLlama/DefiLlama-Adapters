const { sumTokens2 } = require("./helper/unwrapLPs")

async function getVaults(api) {
    const vaults = await api.fetchList({ lengthAbi: 'dsaCounter', itemAbi: 'getDsaByID', target: "0x5390724ca3b0880242c7b1ef08eb9b1abe698c0e" })
    const tokens = ["0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c", "0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8",
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"]
    return { vaults, tokens }
}

module.exports = {
    ethereum: {
        tvl: async (api) => {
            const { vaults, tokens } = await getVaults(api)
            return sumTokens2({ api, tokensAndOwners2: [tokens, vaults]})
        },
    }
}
