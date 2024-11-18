const chains = require("./chains");
const {sumTokens} = require("../helper/sumTokens");

async function tvl(api, chain) {
    let vaults = chains[chain];
    const tokens = vaults.map(vault => vault.asset);
    const balances = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults.map(vault => vault.address) });

    api.addTokens(tokens, balances)

    return sumTokens({ api,chain })
}

Object.keys(chains).forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            return await tvl(api, chain)
        }
    }
})
