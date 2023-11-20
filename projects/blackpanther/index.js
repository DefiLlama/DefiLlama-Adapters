const { sumTokens, endPoints, queryContracts } = require('../helper/chain/cosmos')

async function tvl() {
  const vaultContractsTvl = sumTokens({ owners: await queryContracts({ codeId: 181, chain: 'injective' }), chain: 'injective' })
  const incentiveContractsTvl = sumTokens({ owners: await queryContracts({ codeId: 132, chain: 'injective' }), chain: 'injective' })
  return vaultContractsTvl + incentiveContractsTvl
}

module.exports = {
  doublecounted: false,
  injective: {
    tvl,
  },
}