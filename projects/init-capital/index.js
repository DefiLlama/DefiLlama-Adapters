const { getConfig } = require('../helper/cache')

const POOL_DATA_URI = "https://app.init.capital/static/json/pools.json";

const tvl = async (timestamp, block, _, { api }) => {
  const allPoolData = await getConfig('init-capital', POOL_DATA_URI);
  const pools = Object.keys(allPoolData[api.getChainId()]);
  const tokens = await api.multiCall({ calls: pools, abi: 'address:underlyingToken' })
  return api.sumTokens({ tokensAndOwners2: [tokens, pools] })
};

const borrowed = async (timestamp, block, _, { api }) => {
  const allPoolData = await getConfig('init-capital', POOL_DATA_URI);
  const pools = Object.keys(allPoolData[api.getChainId()]);
  const tokens = await api.multiCall({ calls: pools, abi: 'address:underlyingToken' })
  const debts = await api.multiCall({ abi: "uint256:totalDebt", calls: pools, });
  api.addTokens(tokens, debts);
};

module.exports = {
  methodology:
    "Count all the underlying locked and borrowed under every INIT Lending Pools",
  mantle: {
    tvl,
    borrowed,
  },
};
