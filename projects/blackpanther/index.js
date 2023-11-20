const { sumTokens, endPoints, queryContracts } = require('../helper/chain/cosmos')

async function getOwners() {
    let vaultContracts = await queryContracts({ codeId: 181, chain: 'injective' });
    let incentiveContracts = await queryContracts({ codeId: 132, chain: 'injective' });

    let combinedContracts = [...vaultContracts, ...incentiveContracts];
    return combinedContracts;
}

async function tvl() {
  return sumTokens({ owners: await getOwners(), chain: 'injective' })
}

module.exports = {
  doublecounted: false,
  injective: {
    tvl,
  },
}