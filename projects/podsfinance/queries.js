const { getConfig } = require("../helper/cache.js");
const constants = require("./constants.js");
const { EXPIRATION_START_FROM } = constants;
const { getOptions } = require("./subgraph.js");

async function getTVL(api) {
  const network = constants[api.chain]
  const options = await getConfig('podsfinance/' + api.chain, undefined, {
    fetcher: async () => {
      const data = await getOptions(network, EXPIRATION_START_FROM)
      return data.filter(i => i)
    }
  })
  const tokensAndOwners = []
  options
    .filter(
      (option) =>
        option.strikeAsset &&
        option.underlyingAsset &&
        option.address
    )
    .forEach((option) => tokensAndOwners.push(
      [option.strikeAsset, option.address],
      [option.underlyingAsset, option.address],
    ))

  options
    .filter((option) => option.pool && option.pool.address)
    .forEach((option) => tokensAndOwners.push([option.pool.tokenB, option.pool.address]))


  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  getTVL,
};
