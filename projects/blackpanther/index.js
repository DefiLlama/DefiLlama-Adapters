const { sumTokens, endPoints, queryContracts } = require('../helper/chain/cosmos')


async function tvl() {
  let vaultContracts = await queryContracts({ codeId: 181, chain: 'injective' });
  let incentiveContracts = await queryContracts({ codeId: 132, chain: 'injective' });

  let combinedContracts = [...vaultContracts, ...incentiveContracts];
  return sumTokens({ owners: combinedContracts, chain: 'injective' })
}

module.exports = {
  doublecounted: false,
  injective: {
    tvl,
  },
}