const ownerByChain = require("./owners.js");
const registryTokensByChain = require("./RegistryTokens.js");
const gaugeTokensByChain = require("./gaugeTokens.js");
const beefyTokensByChain = require("./beefyTokens.js");
const pendleTokensByChain = require("./pendleTokens.js");
const { getTokenBalance, fetchTotalValue } = require("./hinkalUtils.js");
const { toUSDTBalances } = require("../helper/balances.js");

const getRegularTokens = (chain) => {
  return [
    registryTokensByChain[chain],
    pendleTokensByChain[chain]?.pt,
    pendleTokensByChain[chain]?.sy,
    beefyTokensByChain[chain],
  ].flat();
};

const getTokensWithUnderlyingAddresses = (chain) => {
  return [gaugeTokensByChain[chain], pendleTokensByChain[chain]?.yt].flat();
};

const tvl = async (_, _1, _2, { chain }) => {
  const regularTokens = getRegularTokens(chain);
  const tokensWithUnderlyingAddresses = getTokensWithUnderlyingAddresses(chain);

  const regularTokenBalances = await Promise.all(
    regularTokens.map(async (token) => {
      return getTokenBalance(token, chain, ownerByChain[chain]);
    })
  );

  const tokensWithUnderlyingAddressesBalances = await Promise.all(
    tokensWithUnderlyingAddresses.map(async (token) => {
      return getTokenBalance(
        token.erc20TokenAddress,
        chain,
        token.underlyingErc20TokenAddress
      );
    })
  );

  const allTokenBalances = [
    ...regularTokenBalances,
    ...tokensWithUnderlyingAddressesBalances,
  ];
  const totalValue = await fetchTotalValue(allTokenBalances, chain);

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
  op_bnb: {
    tvl,
  },
};
