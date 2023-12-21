const { sumTokens2 } = require('../helper/unwrapLPs')
const contracts = require("./contracts.json");

async function tvl(_, _b, _cb, { api, }) {
  const ownerTokens = Object.entries(contracts[api.chain].pools).map(([pool, { underlyingTokens }]) => [underlyingTokens, pool])
  const blacklistedTokens = ownerTokens.map(i => i[1])
  return sumTokens2({ api, ownerTokens, blacklistedTokens })
}

module.exports = {
  methodology:
    "Sum of each liquidity pool's value",
  wemix: {
    tvl
  }
};
