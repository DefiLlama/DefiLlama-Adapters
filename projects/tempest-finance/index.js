const chains = require("./chains");
const axios = require("axios");

async function tvl(api) {
    const response = await axios.get(`https://protocol-service-api.tempestfinance.xyz/api/v1/vaults?chainId=${chains[api.chain]}`)
    const vaults = response.data.data.vaults;

    const tokens = vaults.map(vault => vault.mainAsset);
    const balances = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults.map(vault => vault.address) });

    api.addTokens(tokens, balances)
}

Object.keys(chains).forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            return await tvl(api)
        }
    }
})
