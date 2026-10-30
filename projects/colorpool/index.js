const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require("../helper/http")

// Colorpool dex chain on Chromia; node list and RID from the dex.colorpool.xyz app config
const BLOCKCHAIN_RID = '19571DCB739CCDDC4BC8B96A01C7BDE9FCC389B566DD1B85737E892695674288'
const NODES = [
  'https://dapps0.chromaway.com',
  'https://chromia-mainnet.w3coins.io:7740',
  'https://mainnet-dapp1.sunube.net:7740',
  'https://chromia.nocturnallabs.org:7740',
]

// tokens the coins server prices as chromia:<asset id>
const PRICED = new Set([
  '5f16d1545a0881f971b164f1601cbbf51c29efd0633b2730da18c403c3b428b5', // CHR
  ADDRESSES.chromia.USDC, // USDC
  '9084de203ef2afc7c6bfd647660aa3265d3b9ef1105139077ed3c81b26e2976e', // ALICE
  'd85153c53bc78c6bf177113c5da873669f97bd46db1ab7411e2f8932c7cdd0a8', // D
])

async function query(type, params) {
  const qs = new URLSearchParams({ type, ...params }).toString()
  let lastError
  for (const node of NODES) {
    try {
      return await get(`${node}/query/${BLOCKCHAIN_RID}?${qs}`)
    } catch (e) {
      lastError = e
    }
  }
  throw lastError
}

async function tvl(api) {
  const { data: pools } = await query('get_all_pool', { page: 1, page_size: 1000 })
  const { data: assets } = await query('get_all_asset', { page: 1, page_size: 10000 })
  const idBySymbol = Object.fromEntries(assets.map(({ symbol, id }) => [symbol, id.toLowerCase()]))

  // count both reserves when both tokens are priced, else twice the priced side
  for (const { token0, token1, reserve0, reserve1 } of pools) {
    const id0 = idBySymbol[token0], id1 = idBySymbol[token1]
    const priced0 = PRICED.has(id0), priced1 = PRICED.has(id1)
    if (priced0 && priced1) { api.add(id0, reserve0); api.add(id1, reserve1) }
    else if (priced0) api.add(id0, BigInt(reserve0) * 2n)
    else if (priced1) api.add(id1, BigInt(reserve1) * 2n)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the reserves of all Colorpool pools, read from the Colorpool dapp chain on Chromia (get_all_pool). Only priced tokens are counted; for pools with one priced token, that side is doubled.',
  chromia: { tvl },
}
