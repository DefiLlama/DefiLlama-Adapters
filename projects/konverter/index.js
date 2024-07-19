const { sumTokens2 } = require('../helper/unwrapLPs')
const contracts = require("./contracts.json");

async function tvl(api) {
  const ownerTokens = Object.entries(contracts[api.chain].pools).map(([pool, { underlyingTokens }]) => [underlyingTokens, pool])
  const blacklistedTokens = ownerTokens.map(i => i[1])
  return sumTokens2({ api, ownerTokens, blacklistedTokens })
}

module.exports = {
  methodology:
    "Sum of each liquidity pool's value",
  wemix: {
    tvl
  },
  deadFrom: "2023-12-31", // https://medium.com/@konverter/konverter-service-is-set-to-be-phased-out-bd65dcf6dc34
};
