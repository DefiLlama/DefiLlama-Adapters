const { sumTokens2 } = require("../helper/unwrapLPs");

function tvl({ pool }) {
  return async (api) => {
    const tokenAddresses = await api.call({
      target: pool,
      abi: 'function getAssetWhitelist() view returns (address[] memory)',
    })
    return sumTokens2({ api, owner: pool, tokens: tokenAddresses })
  }
}

// era
const DLPM = '0xfc00dAC251711508D4dD7b0C310e913575988838'

module.exports = {
  era: {
    tvl: tvl({ pool: DLPM, })
  },
};
