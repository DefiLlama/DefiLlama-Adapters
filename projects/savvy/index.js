const contracts = require("./contracts.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

function tvl(chain) {
  return async (timestamp, block, chainBlocks, { api }) => {
    const tokens = Object.values(contracts.baseTokens).concat(Object.values(contracts.yieldTokens));
    await sumTokens2({ tokens, api, owners: Object.values(contracts.tokenHolders) })
  };
}

module.exports = {
  methodology: 'The calculated TVL is the current USD sum of all user deposits and SVY tokens staked in veSVY.',
  arbitrum: {
    tvl: tvl("arbitrum")
  }
}