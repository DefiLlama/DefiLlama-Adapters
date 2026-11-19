const sdk = require('@defillama/sdk')
const { sumTokens2, } = require('../helper/chain/tezos')

const tezos = sdk.chains.tezos

// Plenty Network pools are originated by these factories / the team deployer; the type hashes
// below are the volatile, stable and tez swap pool contracts (everything gauged by the Voter is one of these)
const poolCreators = [
  'KT1McWUGBxEP92a4CpKo3tzfARF6bM2sw5ff', // volatile swap factory
  'KT1LLaqPmDnVdBP1zxEEpPvy3py4Uk4Bymag', // stable swap factory
  'KT1FG1fFEBv7amGagLeXpCytFwiQAfYmkgFb', // tez swap factory
  'tz1NbDzUQCcV2kp3wxdVHVSZEDeq2h97mweW', // deployer of the early pools
]
const poolTypeHashes = [896241296, 1278110930, 1973461520, -1622367811, -509362075, -1446613519]

const tvl = async () => {
  const owners = []
  for (const creator of poolCreators) {
    const pools = await tezos.tzktAll({ path: '/v1/contracts', params: { creator, 'typeHash.in': poolTypeHashes.join(','), select: 'address' } })
    owners.push(...pools)
  }
  return sumTokens2({ owners, includeTezos: true, })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  start: '2023-01-01',
  tezos: { tvl },
}
