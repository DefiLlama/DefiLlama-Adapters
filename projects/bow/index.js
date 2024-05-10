
const { getConfig } = require("../helper/cache");
const { sumTokens } = require('../helper/chain/cosmos')


async function tvl() {
  const contracts = await getConfig("kujira/contracts", "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json");
  const bowPools = contracts["kaiyo-1"].bow.map(x => x.address)
  const owners = [
  ...bowPools
]

  return await sumTokens({ owners, chain: 'kujira' })
}

module.exports = {
    kujira: {
    tvl,
  },
}