const { icp } = require('@defillama/sdk').chains
const { getCache } = require('../helper/http')

const YUSAN_CANISTER = '52mp3-qiaaa-aaaar-qbzja-cai'
const YUSAN_API = 'https://yusan.fi/metrics_json' // served by the canister itself, borrows are only exposed here
const YUSAN_DECIMALS = 8 // internal accounting decimals used by metrics_json

const tokens = {
  ICP: { ledger: 'ryjl3-tyaaa-aaaaa-aaaba-cai', decimals: 8, coingeckoId: 'internet-computer' },
  ckBTC: { ledger: 'mxzaz-hqaaa-aaaar-qaada-cai', decimals: 8, coingeckoId: 'bitcoin' },
  ckDOGE: { ledger: 'efmc5-wyaaa-aaaar-qb3wa-cai', decimals: 8, coingeckoId: 'dogecoin' },
  USDC: { ledger: '53nhb-haaaa-aaaar-qbn5q-cai', decimals: 6, coingeckoId: 'usd-coin' }, // 1sec USDC
  USDT: { ledger: 'ij33n-oiaaa-aaaar-qbooa-cai', decimals: 6, coingeckoId: 'tether' }, // 1sec USDT
  WTN: { ledger: 'jcmow-hyaaa-aaaaq-aadlq-cai', decimals: 8, coingeckoId: 'waterneuron' },
}

async function tvl(api) {
  for (const { ledger, decimals, coingeckoId } of Object.values(tokens)) {
    const balance = await icp.getIcrcBalance({ ledger, owner: YUSAN_CANISTER })
    api.addCGToken(coingeckoId, Number(balance) / 10 ** decimals)
  }
}

async function borrowed(api) {
  const data = await getCache(YUSAN_API)

  for (const [symbol, { coingeckoId }] of Object.entries(tokens)) {
    const balance = data.tokens[symbol]?.total_borrow || 0
    if (balance > 0) api.addCGToken(coingeckoId, balance / 10 ** YUSAN_DECIMALS)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the balance of the Yusan lending canister on each token ledger (supplied assets, collateral and liquidation pool, net of borrows).',
  icp: { tvl, borrowed },
}
