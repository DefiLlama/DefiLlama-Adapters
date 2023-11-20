const { sumTokens, endPoints, queryContracts } = require('../helper/chain/cosmos')

async function tvl() {
  return sumTokens({ owners: await queryContracts({ codeId: 181, chain: 'injective' }), chain: 'injective' })
}

module.exports = {
  doublecounted: false,
  injective: {
    tvl,
  },
}