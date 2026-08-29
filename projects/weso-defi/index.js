const { queryContract, queryContractWithRetries } = require('../helper/chain/cosmos')
const { PromisePool } = require('@supercharge/promise-pool')

const FACTORY = 'terra1veqa6znu8lfdmz9kp9v047chfmn84q5k3pacme75gl8ywmplk92q6xnq2k'
const WESO = 'terra13ryrrlcskwa05cd94h54c8rnztff9l82pp0zqnfvlwt77za8wjjsld36ms'

// Wrap/unwrap pair types hold native LUNC/USTC backing for CWLUNC/CWUSTC.
// Counting them would double-count the same assets already sitting in AMM pools.
const EXCLUDED_PAIR_TYPES = new Set(['token_bonding', 'converter'])

// 1:1 CW20 wraps. Price as the native denom so AMM balances count in TVL.
const PRICE_AS_NATIVE = {
  terra10fusc7487y4ju2v5uavkauf3jdpxx9h8sc7wsqdqg4rne8t4qyrq8385q6: 'uluna', // CWLUNC
  terra1uncwzdhxdktqpx4rj6mkuhl0ekv0raua0058rr7zgnapm9najyyqgtpf6h: 'uusd',  // CWUSTC
}

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
    api.add(PRICE_AS_NATIVE[addr] || addr, amount)
  }
}

async function getAllPairs() {
  const allPairs = []
  let currentPairs
  do {
    const query = { pairs: { limit: 30 } }
    if (allPairs.length) query.pairs.start_after = allPairs[allPairs.length - 1].asset_infos
    currentPairs = (await queryContract({ contract: FACTORY, chain: 'terra', data: query })).pairs ?? []
    allPairs.push(...currentPairs)
  } while (currentPairs.length > 0)
  return allPairs
}

async function tvl(api) {
  const pairs = (await getAllPairs()).filter(isAmmPair)
  const poolContracts = pairs.map(p => p.contract_addr).filter(Boolean)

  const { errors } = await PromisePool
    .withConcurrency(10)
    .for(poolContracts)
    .process(async (pool) => {
      const result = await queryContractWithRetries({ contract: pool, chain: 'terra', data: { pool: {} } })
      for (const asset of result?.assets ?? []) {
        const { info, amount } = asset
        if (!amount || amount === '0') continue
        addAsset(api, info, amount)
      }
    })

  if (errors.length > poolContracts.length / 2) {
    throw new Error(`Too many pool query failures: ${errors.length}/${poolContracts.length}`)
  }

  // $WESO is a cw20_bonding curve vs native LUNC, not a factory AMM pair.
  // TVL is the LUNC reserve locked in the curve. CWLUNC/CWUSTC wraps stay excluded.
  const curve = await queryContractWithRetries({ contract: WESO, chain: 'terra', data: { curve_info: {} } })
  if (curve?.reserve && curve.reserve !== '0') {
    api.add(curve.reserve_denom || 'uluna', curve.reserve)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is AMM pool reserves on the WESO DeFi factory plus the native LUNC locked in the $WESO bonding curve (terra13ryrrlcskwa05cd94h54c8rnztff9l82pp0zqnfvlwt77za8wjjsld36ms). Wrap/unwrap (token_bonding and converter) contracts for CWLUNC and CWUSTC are excluded to avoid double-counting. CWLUNC and CWUSTC balances inside AMM pools are priced as native LUNC and USTC (1:1 wraps).',
  terra: { tvl },
}
