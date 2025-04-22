const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
    tron: {
        tvl: async (api) => {
            const supply = await api.call({ abi: "erc20:totalSupply", target: "TThzxNRLrW2Brp9DcTQU8i4Wd9udCWEdZ3" })
            return {
                [ADDRESSES.ethereum.USDT]: supply/1e12
            }
        }
    },
    ethereum: {
        tvl: async (api) => {
            const supply = await api.call({ abi: "erc20:totalSupply", target: "0x25ec98773d7b4ced4cafab96a2a1c0945f145e10" })
            return {
                [ADDRESSES.ethereum.USDT]: supply/1e12
            }
        }
    }
}
