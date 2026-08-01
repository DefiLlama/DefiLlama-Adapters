const { sumTokens, endPoints, queryContracts } = require('../helper/chain/cosmos')

async function tvl() {
  return sumTokens({ owners: await queryContracts({ codeId: 21, chain: 'kujira' }), chain: 'kujira' })
}

module.exports = {
    kujira: {
    tvl,
  },
}