const { sumTokens, endPoints, queryContracts } = require('../helper/chain/cosmos')


async function tvl() {
  const owners = [
    "inj1xug34v8e887uzcc9mr2pql06h2ztvhxxm6asll",
  ]
  return sumTokens({ owners, chain: 'injective' })
}

module.exports = {
  injective: {
    tvl,
  },
}
