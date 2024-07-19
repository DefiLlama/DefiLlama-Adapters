const abi = require("./abi.json");
const { staking } = require("../helper/staking.js");
const { cachedGraphQuery } = require('../helper/cache')

const config = {
  ethereum: {
    subgraphUrl:
      "https://api.studio.thegraph.com/query/41372/spool-v2_mainnet/version/latest",
  },
};

module.exports = {
  methodology: `Counting assets deployed to each strategy`,
};

const allStrategiesQuery = `
  query MyQuery {
    strategies(where: { isRemoved: false, isGhost: false }) {
      id
      isRemoved
      assetGroup {
        assetGroupTokens {token { id } }
      }
    }
  }`

Object.keys(config).forEach((chain) => {
  const { subgraphUrl } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      let { strategies } = await cachedGraphQuery(`spool-v2-${chain}`, subgraphUrl, allStrategiesQuery)
      const tokens = strategies.map((i) => i.assetGroup.assetGroupTokens.map(i => i.token.id));
      strategies = strategies.map(i => i.id);
      let strategiesAssetAmounts = await api.multiCall({ abi: abi.strategyUnderlyingAmountAbi, calls: strategies, });
      strategiesAssetAmounts.forEach((bals, i) => api.addTokens(tokens[i], bals))
      return api.getBalances();
    },
  };
});

const SPOOL = "0x40803cea2b2a32bda1be61d3604af6a814e70976";
const SPOOL_staking = "0xc3160C5cc63B6116DD182faA8393d3AD9313e213";
module.exports.ethereum.staking = staking(SPOOL_staking, SPOOL);
