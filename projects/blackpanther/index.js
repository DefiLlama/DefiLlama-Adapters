const { sumTokens, queryContracts } = require('../helper/chain/cosmos')

async function getContracts() {
  let vaultContracts = await queryContracts({ codeId: 181, chain: 'injective' });
  let incentiveContracts = await queryContracts({ codeId: 132, chain: 'injective' });

  let combinedContracts = vaultContracts.concat(incentiveContracts);
  return combinedContracts
}

async function tvl() {

  return sumTokens({ owners: await getContracts(), chain: 'injective' })
}

module.exports = {
  doublecounted: false,
  injective: {
    tvl,
  },
}
