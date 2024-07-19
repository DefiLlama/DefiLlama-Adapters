const REVA_CHEF = "0xd7550285532f1642511b16Df858546F2593d638B";
const REVA_CHEF_ABI = require("./RevaChef.json");
const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(api) {
  const tokens = await api.fetchList({  lengthAbi: 'uint256:getSupportedTokensCount', itemAbi: 'function supportedTokens(uint256) view returns (address)', target: REVA_CHEF})
  const bals = await api.multiCall({  abi: REVA_CHEF_ABI.tokens, calls: tokens, target: REVA_CHEF})
  api.addTokens(tokens, bals.map(i => i.totalPrincipal))
  return sumTokens2({ api, resolveLP: true })
}

module.exports = {
  start: 1634150000,        // 13th of October, 2021
	bsc: {
		tvl,
  },
}
