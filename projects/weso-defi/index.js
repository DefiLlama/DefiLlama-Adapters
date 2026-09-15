const { queryContract, queryContractWithRetries, getBalance2 } = require('../helper/chain/cosmos')
const { PromisePool } = require('@supercharge/promise-pool')

const FACTORY = 'terra1veqa6znu8lfdmz9kp9v047chfmn84q5k3pacme75gl8ywmplk92q6xnq2k'
const WESO = 'terra13ryrrlcskwa05cd94h54c8rnztff9l82pp0zqnfvlwt77za8wjjsld36ms'
const REBASE = 'terra1uewxz67jhhhs2tj97pfm2egtk7zqxuhenm4y4m'
// Wrap vaults — bank balances are circulating 1:1 backing (not mint-cap total_supply / curve_info.reserve).
const CWUSTC = 'terra1uncwzdhxdktqpx4rj6mkuhl0ekv0raua0058rr7zgnapm9najyyqgtpf6h'
const CWLUNC = 'terra10fusc7487y4ju2v5uavkauf3jdpxx9h8sc7wsqdqg4rne8t4qyrq8385q6'

// Wrap/unwrap pair types' pool queries would mint-cap double-count.
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
    // CWLUNC in AMM pools (e.g. JURIS/CWLUNC) is a 1:1 claim on wrap-bank LUNC already
    // counted via getBalance2 below — skip the token side so only the other asset (JURIS) remains.
    if (addr === CWLUNC) return
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
  const curve = await queryContractWithRetries({ contract: WESO, chain: 'terra', data: { curve_info: {} } })
  if (curve?.reserve && curve.reserve !== '0') {
    api.add(curve.reserve_denom || 'uluna', curve.reserve)
  }

  // $reBASE is a cw20_bonding curve vs USTC. Use curve_info.reserve (same pattern as $WESO):
  // on-contract bank is only ~1M USTC; the rest is routed to reserve/ops/growth/dev pools and the
  // validator multisig (to_validator_pct). Those balances roughly match curve_info.reserve (~3.8M UUSD).
  const rebase = await queryContractWithRetries({ contract: REBASE, chain: 'terra', data: { curve_info: {} } })
  if (rebase?.reserve && rebase.reserve !== '0') {
    api.add(rebase.reserve_denom || 'uusd', rebase.reserve)
  }

  // Wrap banks = circulating 1:1 backing. Skip CWLUNC token amounts in AMM pools above so bank
  // LUNC is not double-counted with pool CWLUNC. CWUSTC has no AMM inventory, so bank uusd is additive.
  await getBalance2({ owner: CWUSTC, chain: 'terra', tokens: ['uusd'], api })
  await getBalance2({ owner: CWLUNC, chain: 'terra', tokens: ['uluna'], api })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is AMM pool reserves on the WESO DeFi factory plus the native LUNC locked in the $WESO bonding curve (terra13ryrrlcskwa05cd94h54c8rnztff9l82pp0zqnfvlwt77za8wjjsld36ms), plus native USTC locked for the $reBASE bonding curve via curve_info.reserve (terra1uewxz67jhhhs2tj97pfm2egtk7zqxuhenm4y4m; reserve spans the curve contract bank plus routed reserve/ops/growth/dev and validator-multisig USTC), plus native USTC (uusd) in the CWUSTC wrap vault bank (terra1uncwzdhxdktqpx4rj6mkuhl0ekv0raua0058rr7zgnapm9najyyqgtpf6h) and native LUNC (uluna) in the CWLUNC wrap vault bank (terra10fusc7487y4ju2v5uavkauf3jdpxx9h8sc7wsqdqg4rne8t4qyrq8385q6) as circulating 1:1 backing. Wrap/unwrap (token_bonding and converter) pool queries are excluded. CWLUNC token balances inside AMM pools (e.g. JURIS/CWLUNC terra14jed…322v7) are skipped because that CWLUNC is already backed by wrap-bank LUNC; the other pool asset (JURIS) is still counted. Mint-cap token_info.total_supply / curve_info.reserve on wraps are never used.',
  terra: { tvl },
}
