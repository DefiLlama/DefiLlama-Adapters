const { queryContract, queryContractWithRetries } = require('../helper/chain/cosmos')
const { PromisePool } = require('@supercharge/promise-pool')

const FACTORY = 'terra1veqa6znu8lfdmz9kp9v047chfmn84q5k3pacme75gl8ywmplk92q6xnq2k'
const WESO = 'terra13ryrrlcskwa05cd94h54c8rnztff9l82pp0zqnfvlwt77za8wjjsld36ms'

// Wrap/unwrap pair types hold native LUNC/USTC backing for CWLUNC/CWUSTC.
// Counting them would double-count the same assets already sitting in AMM pools.
const EXCLUDED_PAIR_TYPES = new Set(['token_bonding', 'converter'])

function pairTypeKey(pairType) {
  if (!pairType) return ''
  if (typeof pairType === 'string') return pairType.toLowerCase()
  if (typeof pairType === 'object') {
    const key = Object.keys(pairType)[0]
    if (key === 'custom' && typeof pairType.custom === 'string') return pairType.custom.toLowerCase()
    return (key || '').toLowerCase()
  }
  return ''
}

function isAmmPair(pair) {
  return !EXCLUDED_PAIR_TYPES.has(pairTypeKey(pair.pair_type))
}

function addAsset(api, info, amount) {
  if (info.native_token) {
    api.add(info.native_token.denom, amount)
    return
  }
  if (info.token) {
    const addr = info.token.contract_addr
    api.add(addr, amount)
  }
}

async function getAllPairs() {
  const allPairs = []
  let currentPairs
  do {
    const query = { pairs: { limit: 30 } }
    if (allPairs.length) query.pairs.start_after = allPairs[allPairs.length - 1].asset_infos
    const { pairs } = await queryContract({ contract: FACTORY, chain: 'terra', data: query })
    if (!Array.isArray(pairs)) throw new Error('WESO factory returned a malformed pairs response')
    currentPairs = pairs
    allPairs.push(...currentPairs)
  } while (currentPairs.length > 0)
  return allPairs
}

async function tvl(api) {
  const pairs = (await getAllPairs()).filter(isAmmPair)
  const poolContracts = pairs.map(p => p.contract_addr).filter(Boolean)

  await PromisePool
    .withConcurrency(10)
    .for(poolContracts)
    .handleError((error) => { throw error })
    .process(async (pool) => {
      const result = await queryContractWithRetries({ contract: pool, chain: 'terra', data: { pool: {} } })
      if (!Array.isArray(result?.assets)) throw new Error(`WESO pool ${pool} returned a malformed assets response`)
      for (const asset of result.assets) {
        const { info, amount } = asset
        if (!amount || amount === '0') continue
        addAsset(api, info, amount)
      }
    })

  // $WESO is a cw20_bonding curve vs native LUNC, not a factory AMM pair.
  // TVL is the LUNC reserve locked in the curve. CWLUNC/CWUSTC wraps stay excluded.
  const curve = await queryContractWithRetries({ contract: WESO, chain: 'terra', data: { curve_info: {} } })
  if (curve?.reserve && curve.reserve !== '0') {
    api.add(curve.reserve_denom || 'uluna', curve.reserve)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is AMM pool reserves on the WESO DeFi factory plus the native LUNC locked in the $WESO bonding curve (terra13ryrrlcskwa05cd94h54c8rnztff9l82pp0zqnfvlwt77za8wjjsld36ms). Wrap/unwrap (token_bonding and converter) contracts for CWLUNC and CWUSTC are excluded to avoid double-counting.',
  terra: { tvl },
}
