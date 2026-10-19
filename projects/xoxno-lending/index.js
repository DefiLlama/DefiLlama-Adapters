const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')
const { callSoroban } = require('../helper/chain/stellar')
const { getEnv } = require('../helper/env')
const { get, post } = require('../helper/http')
const methodologies = require('../helper/methodologies')

// Market registry only: every amount is read from chain.
const EXPORTS = {
  stellar: 'https://api.xoxno.com/integrations/lending/stellar',
  elrond: 'https://api.xoxno.com/integrations/lending/multiversx',
}

const HEADERS = { 'User-Agent': 'dune-analytics' }

async function getMarkets(chain) {
  // Endpoint omitted on purpose: getConfig ignores `fetcher` when one is
  // passed, and its axios path cannot send the required header.
  const data = await getConfig(`xoxno-lending/${chain}`, undefined, {
    fetcher: () => get(EXPORTS[chain], { headers: HEADERS, timeout: 10000 }),
  })
  const markets = chain === 'stellar' ? data.hubMarkets : data.markets
  if (!Array.isArray(markets)) throw new Error(`xoxno-lending: no markets in ${chain} export`)
  return markets
}

// HubAssetKey { hub_id: u32, asset: Address }
const hubAssetKey = (market) => ({
  type: 'map',
  value: {
    hub_id: { type: 'u32', value: market.hubId },
    asset: { type: 'address', value: market.token },
  },
})

// ManagedDecimal: [4B len][value big-endian][4B scale]. Zero has len 0, so an
// empty payload is a real 0, not a failure.
async function mvxView(address, fn) {
  const res = await post(getEnv('MULTIVERSX_RPC') + '/query', { scAddress: address, funcName: fn, args: [] })
  if (res?.returnCode !== 'ok') throw new Error(`xoxno-lending: ${fn}() on ${address} returned ${res?.returnCode}`)
  const encoded = res.returnData?.[0]
  if (!encoded) return '0'
  const buf = Buffer.from(encoded, 'base64')
  const len = buf.readUInt32BE(0)
  if (!len) return '0'
  return BigInt('0x' + buf.subarray(4, 4 + len).toString('hex')).toString()
}

function addAmounts(chain, stellarFn, mvxFn) {
  return async (api) => {
    const markets = await getMarkets(chain)
    await Promise.all(markets.map(async (market) => {
      const amount = chain === 'stellar'
        ? await callSoroban(market.marketAddress, stellarFn, [hubAssetKey(market)])
        : await mvxView(market.marketAddress, mvxFn)
      // DefiLlama prices native EGLD under the null address; `elrond:EGLD`
      // resolves to nothing and would drop the largest market.
      const token = chain === 'elrond' && market.token === 'EGLD' ? ADDRESSES.null : market.token
      api.add(token, amount.toString())
    }))
  }
}

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket} Pool cash is read on chain per market (get_reserves on Stellar, reserves() on MultiversX). Outstanding debt is reported separately as borrowed.`,
}

for (const chain of Object.keys(EXPORTS)) {
  module.exports[chain] = {
    tvl: addAmounts(chain, 'get_reserves', 'reserves'),
    borrowed: addAmounts(chain, 'get_borrowed_amount', 'borrowedAmount'),
  }
}
