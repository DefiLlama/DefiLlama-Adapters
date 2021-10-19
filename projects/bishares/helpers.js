
const sdk = require("@defillama/sdk");

const getTokenWithChainPrefix = (tokenAddress, chain) => `${chain}:${tokenAddress}`
const combineTvlParts = (...tvlParts) => {
  const tvl = {};
  Object.values({
    ...tvlParts
  }).forEach((tvlPart) => {
    Object.entries(tvlPart).forEach(([token, value]) => {
      sdk.util.sumSingleBalance(tvl, token, value);
    });
  });
  return tvl;
}

module.exports = {
  getTokenWithChainPrefix,
  combineTvlParts
}