const { get } = require("../helper/http");
const { sumTokens, endPoints } = require('../helper/chain/cosmos')


async function tvl() {
  const bowPoolCodes = [46, 54, 36];
  const bowPools = (await Promise.all(bowPoolCodes.map(async (code) => {
    const result = await get(endPoints.kujira + `/cosmwasm/wasm/v1/code/${code}/contracts?pagination.limit=100`);
    return result.contracts;
  }))).flat();
  const owners = [
  ...bowPools
]

  return await sumTokens({ owners, chain: 'kujira' })
}

module.exports = {
  doublecounted: false,
  kujira: {
    tvl,
  },
}