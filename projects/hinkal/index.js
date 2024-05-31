const registryTokensByChain = require("./registryTokens.js");
const { getAllTokenBalances, fetchTotalValue } = require("./hinkalUtils.js");
const { toUSDTBalances } = require("../helper/balances.js");

const tvl = async (_, _1, _2, { chain }) => {
  const tokenBalances = await getAllTokenBalances(
    registryTokensByChain[chain],
    chain
  );

  const totalValue = await fetchTotalValue(tokenBalances, chain);

  return toUSDTBalances(
    totalValue.reduce((acc, token) => acc + token.tokenBalance, 0)
  );
};

module.exports = {
  ethereum: {
    tvl,
  },
  base: {
    tvl,
  },
  arbitrum: {
    tvl,
  },
  optimism: {
    tvl,
  },
  polygon: {
    tvl,
  },
  avax: {
    tvl,
  },
  bsc: {
    tvl,
  },
  // blast: {
  //   tvl,
  // },
};
