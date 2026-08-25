const { queryContract, queryContractWithRetries } = require('../helper/chain/cosmos')
const { PromisePool } = require('@supercharge/promise-pool')

// Columbus-5 factory. Same pin as https://gitlab.com/PlasticDigits/cl8y-dex-terraclassic
const FACTORY = 'terra1ejpgvv7g3hj0u6fpcnxhflqp84g0w3cnaskqkg5733ygwlmf963sfchsea'
const PAGE_LIMIT = 30
// 1:1 wrap CW20s of native uluna / uusd. Counted as those denoms so Llama can price them.
const CLUNC = 'terra1437qslye72t7qmmahn4t5chz50r8a62g45phwkquwpyu2l62u6ksqssgdg'
const CUSTC = 'terra1nap4dxh9tv35v0ynd9m4k6zt6c0dq6weszc4j5m564kjls56hu7qcr56ch'

function addAsset(api, info, amount) {
  if (amount == null || String(amount) === '0') return
  if (info.native_token) {
    api.add(info.native_token.denom, amount)
    return
  }
  const addr = info.token && info.token.contract_addr
  if (!addr) return
  if (addr === CLUNC) api.add('uluna', amount)
  else if (addr === CUSTC) api.add('uusd', amount)
  else api.add(addr, amount)
}

async function getAllPairs() {
  const allPairs = []
  let currentPairs
  do {
    const query = { pairs: { limit: PAGE_LIMIT } }
    if (allPairs.length) query.pairs.start_after = allPairs[allPairs.length - 1].asset_infos
    currentPairs = (await queryContract({ contract: FACTORY, chain: 'terra', data: query })).pairs ?? []
    allPairs.push(...currentPairs)
  } while (currentPairs.length > 0)
  return allPairs
}

async function tvl(api) {
  const pairs = await getAllPairs()
  const poolContracts = pairs.map((p) => p.contract_addr).filter(Boolean)

  const { errors } = await PromisePool
    .withConcurrency(10)
    .for(poolContracts)
    .process(async (pool) => {
      const result = await queryContractWithRetries({ contract: pool, chain: 'terra', data: { pool: {} } })
      for (const asset of result?.assets ?? []) {
        addAsset(api, asset.info || {}, asset.amount)
      }
    })

  if (errors.length > poolContracts.length / 2) {
    throw new Error(`cl8y-dex TVL: ${errors.length}/${poolContracts.length} pool queries failed`)
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    'TVL is the sum of raw native denoms and CW20 balances returned by factory-listed pair Pool {} queries on Terra Classic. cLUNC and cUSTC (1:1 wraps of uluna / uusd) are counted as those natives so Llama can price them. Other CW20s (UST1, USTR, CL8Y, gems) are added by contract and omitted if unpriced. LP share tokens, limit-book escrow, wrap-mapper native inventory, treasury, and UST1-window inventory are omitted. Indexer USD and CoinGecko liquidity_in_usd are never used.',
  terra: { tvl },
}
