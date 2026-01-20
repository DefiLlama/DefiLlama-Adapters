const {CONFIG} = require("./constants.js")
const { sumTokens2 } = require('../helper/unwrapLPs')

Object.keys(CONFIG).forEach((chain) => {
    const vaults = CONFIG[chain];
    module.exports[chain] = {
        tvl: async (api) => {
            const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
            let bals = await api.multiCall({ abi: 'erc20:totalSupply', calls: vaults })
            const ratio = await api.multiCall({ abi: 'uint256:pricePerShare', calls: vaults })
            const decimals = await api.multiCall({ abi: 'uint256:decimals', calls: vaults })
            bals = bals.map((bal, i) => bal * ratio[i] / 10 ** decimals[i])
            api.addTokens(tokens, bals)

            return sumTokens2({ api, resolveLP: true, })
        }
    }
});