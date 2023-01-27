const { get } = require("../helper/http");
const { sumTokens, endPoints } = require('../helper/chain/cosmos')


async function tvl() {
  const { contracts: blackWhaleVaults } = await get(endPoints.kujira + "/cosmwasm/wasm/v1/code/21/contracts?pagination.limit=100");
 
  const owners = [
     ...blackWhaleVaults,
  ]
  return sumTokens({ owners, chain: 'kujira' })
}

module.exports = {
  doublecounted: false,
  kujira: {
    tvl,
  },
}