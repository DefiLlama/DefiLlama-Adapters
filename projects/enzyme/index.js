const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  polygon: { endpoint: 'https://api.thegraph.com/subgraphs/name/enzymefinance/enzyme-core-polygon' },
  ethereum: { endpoint: 'https://api.thegraph.com/subgraphs/name/enzymefinance/enzyme-core' },
}
const query = `query get_accounts($lastId: String!) {
  vaults(
    first: 1000
    where: {id_gt: $lastId}
  ) { id trackedAssets { id } }
}`

async function tvl(api) {
  const { endpoint } = config[api.chain]
  const vaults = await cachedGraphQuery('enzyme/' + api.chain, endpoint, query, { fetchById: true, })
  return sumTokens2({
    api, ownerTokens: vaults.map(i => {
      return [i.trackedAssets.map(i => i.id), i.id]
    })
  })
}


module.exports = {
  timetravel: false,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})