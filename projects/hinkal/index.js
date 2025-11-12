const registryTokensByChain = require("./registryTokens.js");
const registryTokensWithUnderlyingAddressesByChain = require("./registryTokensWithUnderlyingAddresses.js");
const { getAllTokenBalances } = require("./hinkalUtils.js");
const { toUSDTBalances } = require("../helper/balances.js");

const tvl = async (_, _1, _2, { chain, api }) => {
  const tokenBalances = await getAllTokenBalances(
    registryTokensByChain[chain],
    chain
  );

  const chainTokensWithUnderlyingAddresses =
    registryTokensWithUnderlyingAddressesByChain[chain];

  const mappedTokens = tokenBalances.map((token) => {
    const tokenUnderlyingAddress = chainTokensWithUnderlyingAddresses
      ? chainTokensWithUnderlyingAddresses[token.address]
      : undefined;

    return {
      address: tokenUnderlyingAddress ? tokenUnderlyingAddress : token.address,
      balance: token.balance,
    };
  });

  return api.addTokens(
    mappedTokens.map((token) => token.address),
    mappedTokens.map((token) => token.balance)
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
  blast: {
    tvl,
  },
};
