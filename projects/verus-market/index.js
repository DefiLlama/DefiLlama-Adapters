const { post } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')

const RPC_URL = 'https://api.verus.services'
const RPC_TIMEOUT_MS = 60_000
const FRACTIONAL_OPTION = 0x01 // basket flag
const SYSTEM_TYPES = ['local', 'imported'] // imported = PBaaS bridge baskets

async function getBaskets() {
  const baskets = []
  for (const systemtype of SYSTEM_TYPES) {
    const { result, error } = await post(RPC_URL, { jsonrpc: '1.0', id: 'defillama', method: 'listcurrencies', params: [{ systemtype }] }, { timeout: RPC_TIMEOUT_MS })
    if (error || !Array.isArray(result)) throw new Error(`verus: listcurrencies ${systemtype} failed: ${JSON.stringify(error)}`)
    for (const { currencydefinition, bestcurrencystate } of result) {
      if (!(currencydefinition.options & FRACTIONAL_OPTION) || !bestcurrencystate?.reservecurrencies) continue
      const tokens = bestcurrencystate.reservecurrencies.map(({ currencyid, reserves }) => {
        if (!Number.isFinite(reserves) || reserves < 0) throw new Error(`verus: bad reserves ${reserves} of ${currencyid} in ${currencydefinition.currencyid}`)
        return { i_address: currencyid, reserves }
      })
      baskets.push({ lp_address: currencydefinition.currencyid, tokens })
    }
  }
  if (baskets.length === 0) throw new Error('verus: listcurrencies returned no baskets')
  return baskets
}

// verus bridge address? https://etherscan.io/address/0x71518580f36feceffe0721f06ba4703218cd7f63
async function tvl(api) {
  const results = await getBaskets()

  const blacklist = new Set(results.map(i => i.lp_address))
  const processed = new Set()
  const data = []
  results.forEach(({ tokens, lp_address, }) => {
    if (processed.has(lp_address)) return;
    processed.add(lp_address)

    if (tokens.length < 2) return;

    const isXYPair = tokens.length === 2
    const noBlacklistedTokens = !tokens.some(i => blacklist.has(i.i_address))
    tokens = tokens.filter(i => !blacklist.has(i.i_address))

    if (isXYPair & noBlacklistedTokens) {
      data.push({
        token0: tokens[0].i_address,
        token1: tokens[1].i_address,
        token0Bal: tokens[0].reserves,
        token1Bal: tokens[1].reserves,
      })
    } else {
      tokens.forEach(i => api.add(i.i_address, i.reserves))
    }
  })

  return transformDexBalances({ data, api, })
}

module.exports = {
  methodology: 'Counts the reserves held by Verus DeFi basket currencies, read from the Verus daemon (listcurrencies). Basket currencies held as reserves of other baskets are skipped so they are not counted twice.',
  verus: { tvl },
  timetravel: false,
  misrepresentedTokens: true,
}
