const { get } = require("../helper/http");
const { sumTokens, endPoints } = require('../helper/chain/cosmos')


async function tvl() {
  const { contracts: calcVaults } = await get(endPoints.kujira + "/cosmwasm/wasm/v1/code/68/contracts?pagination.limit=100");
  const owners = [
    ...calcVaults,
  ]
  return sumTokens({ owners, chain: 'kujira' })
}

module.exports = {
  kujira: {
    tvl,
  },
}