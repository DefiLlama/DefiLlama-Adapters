const { sumTokens, query } = require("../helper/chain/fuel")
const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

const markets = [
  '0x657ab45a6eb98a4893a99fd104347179151e8b3828fd8f2a108cc09770d1ebae', // USDC market
]
async function tvl(api) {
  return sumTokens({ api, owners: markets, })
}

async function borrowed(api) {
  const abi = await getConfig('swaylend/abi', undefined, {
    fetcher: async () => {
      let data = await get('https://raw.githubusercontent.com/Swaylend/swaylend-monorepo/refs/heads/develop/apps/frontend/src/contract-types/Market.ts')
      data = data.split('const abi =')[1].split(';')[0]
      return JSON.parse(data) // ensure that this doesnt fail
      // return data
    }
  })
  const whitelistedFunctions = new Set(['get_market_configuration', 'get_market_basics'])
  abi.functions = abi.functions.filter(i => whitelistedFunctions.has(i.name))
  abi.loggedTypes = []
  for (const market of markets) {
    const { base_token } = await query({ contractId: market, abi, method: 'get_market_configuration' })
    const { total_borrow_base } = await query({ contractId: market, abi, method: 'get_market_basics' })
    api.add(base_token.bits, +total_borrow_base)
  }
}

module.exports = {
  fuel: { tvl, borrowed, },
  timetravel: false,
}

