const { sumTokens } = require('../helper/chain/cosmos')
const { getConfig } = require("../helper/cache");


async function tvl() {
  const contracts = await getConfig("kujira/contracts", "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json");
  const orcaPools = contracts["kaiyo-1"].orca.map(x => x.address)
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
