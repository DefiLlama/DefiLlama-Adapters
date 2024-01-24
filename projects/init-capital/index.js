const axios = require("axios");

const POOL_DATA_URI = "https://app.init.capital/static/json/pools.json";
const MANTLE_CHAIN_ID = 5000;

const tvl = async (timestamp, block, _, { api }) => {
  const allPoolData = await axios.get(POOL_DATA_URI);
  const mantlePoolData = allPoolData.data[MANTLE_CHAIN_ID];

  const poolAddresses = Object.keys(mantlePoolData);
  const underlyingAddresses = poolAddresses.map(
    (pool) => mantlePoolData[pool].underlyingToken
  );

  const cashes = await api.multiCall({
    abi: "uint256:cash",
    calls: poolAddresses,
    block,
  });

  api.addTokens(underlyingAddresses, cashes);

  return api.getBalances();
};

const borrowed = async (timestamp, block, _, { api }) => {
  const allPoolData = await axios.get(POOL_DATA_URI);
  const mantlePoolData = allPoolData.data[MANTLE_CHAIN_ID];

  const poolAddresses = Object.keys(mantlePoolData);
  const underlyingAddresses = poolAddresses.map(
    (pool) => mantlePoolData[pool].underlyingToken
  );

  const debts = await api.multiCall({
    abi: "uint256:totalDebt",
    calls: poolAddresses,
    block,
  });

  api.addTokens(underlyingAddresses, debts);

  return api.getBalances();
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Count all the underlying locked and borrowed under every INIT Lending Pools",
  start: 41409518,
  mantle: {
    tvl,
    borrowed,
  },
};
