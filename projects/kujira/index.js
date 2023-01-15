const { get } = require("../helper/http");
const { sumTokens, endPoints } = require('../helper/chain/cosmos')


async function tvl() {
  const { pairs } = await get("https://api.kujira.app/api/coingecko/pairs");
  const pairAddresses = pairs.map((pair) => pair.pool_id);
  const { contracts: uskCDPs } = await get(endPoints.kujira + "/cosmwasm/wasm/v1/code/19/contracts?pagination.limit=100");
  const owners = [
    ...uskCDPs,
  ]
  return sumTokens({ owners, chain: 'kujira' })
}

module.exports = {
  kujira: {
    tvl,
  },
}