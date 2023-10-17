const { post } = require('../http')
const { getUniqueAddresses, } = require('../tokenMapping')
const { getFixBalancesSync } = require('../portedTokens')
const { sliceIntoChunks } = require('../utils')
const chain = 'radixdlt'

const ENTITY_DETAILS_URL = `https://mainnet.radixdlt.com/state/entity/details`

async function sumTokens({ owner, owners = [], api, }) {
  const fixBalances = getFixBalancesSync(chain)

  if (owner) owners.push(owner)
  owners = getUniqueAddresses(owners)
  if (!owners.length) return api.getBalances()
  console.log('fetching tokens for ', owners.length, 'addresses')

  let items = await queryAddresses({ addresses: owners })
  items.forEach((item) => {
    item.fungible_resources.items.forEach(({ resource_address, amount }) => {
      api.add(resource_address, +amount)
    });
  });
  return fixBalances(api.getBalances())
}

async function queryAddresses({ addresses = [], }) {
  let items = []
  const chunks  = sliceIntoChunks(addresses, 20)
  for (const chunk of chunks) {
    const body = {
      "addresses": chunk,
      "opt_ins": { "explicit_metadata": ["name"] }
    }
    let data = await post(ENTITY_DETAILS_URL, body)
    items.push(...data.items)
  }
  return items
}

function sumTokensExport(...args) {
  return async (_, _1, _2, { api }) => sumTokens({ ...args, api, })
}

module.exports = {
  queryAddresses,
  sumTokens,
  sumTokensExport,
}
