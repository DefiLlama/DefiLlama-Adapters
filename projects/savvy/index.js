const contracts = require("./contracts.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

function tvl(chain) {
  return async (timestamp, block, chainBlocks, { api }) => {
    const tokens = Object.values(contracts.baseTokens).concat(Object.values(contracts.yieldTokens));
    await sumTokens2({ tokens, api, owners: Object.values(contracts.tokenHolders) })
  };
}

module.exports = {
  methodology: 'The calculated TVL is the current sum of all base tokens and yield tokens in our contracts.',
  arbitrum: {
    tvl: tvl("arbitrum")
  }
}