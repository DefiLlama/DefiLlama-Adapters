const { get } = require("../helper/http");
const { sumTokens, endPoints } = require('../helper/chain/cosmos')


async function tvl() {
  const { contracts: orcaPools } = await get(endPoints.kujira + "/cosmwasm/wasm/v1/code/59/contracts?pagination.limit=100");
  const owners = [
    ...orcaPools,
  ]
  return sumTokens({ owners, chain: 'kujira' })
}

module.exports = {
  hallmarks: [
    [1673740800, "TVL separated into products"]
  ],
  kujira: {
    tvl,
  },
}
