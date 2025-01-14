const { getConfig } = require("../helper/cache");

async function getMarkets() {
    return getConfig('nucleus-vaults', "https://backend.nucleusearn.io/v1/protocol/markets");
}

async function getTokens() {
    return getConfig('nucleus-tokens', "https://backend.nucleusearn.io/v1/protocol/tokens");
}


const tvl = async (api) => {
  
    const vaultMap = await getMarkets();
    const owners = Object.keys(vaultMap);
    const tokens = await getTokens();
    
    return api.sumTokens({ owners, tokens })
  };

module.exports = {
    ethereum: {
      tvl,
    },
  };