const registryTokensByChain = require("./registryTokens.js");
const registryTokensWithUnderlyingAddressesByChain = require("./registryTokensWithUnderlyingAddresses.js");
const { getAllTokenBalances } = require("./hinkalUtils.js");
const { toUSDTBalances } = require("../helper/balances.js");

const tvl = async (_, _1, _2, { chain, api }) => {
  const tokenBalances = await getAllTokenBalances(
    registryTokensByChain[chain],
    chain
  );

  const mappedTokens = tokenBalances.map((token) => {
    const underlyingAddress =
      registryTokensWithUnderlyingAddressesByChain[token.address];
    return {
      address: underlyingAddress ? underlyingAddress : token.address,
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
