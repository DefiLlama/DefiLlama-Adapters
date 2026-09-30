const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

// Kaleido swap: Uniswap-V3-style pools created by Kaleido's own factory on Arc. Pools are discovered from the
// factory's PoolCreated events, so pools created later are picked up automatically.
const FACTORY = '0xbB74f2319494461B2591F8fbF126654Dd4c2a649'
const FROM_BLOCK = 21219000 // just before the first pool was created (factory deployed at 21128631)

// The pools' quote asset is a WETH9 deployed on Arc that wraps native USDC 1:1 (18 decimals). It has no price
// of its own, so its balance is counted as USDC (6 decimals) below.
const WRAPPED_NATIVE = '0x8c6c0A4C5500c2bC196383B4D85feb7f08a5C75b'

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: FROM_BLOCK,
    eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
    onlyArgs: true,
  })
  const ownerTokens = logs.map(l => [[l.token0, l.token1], l.pool])
  const balances = await sumTokens2({ api, ownerTokens, resolveLP: false })

  const key = Object.keys(balances).find(k => k.toLowerCase() === `arc:${WRAPPED_NATIVE.toLowerCase()}`)
  if (key) {
    const raw = BigInt(balances[key].toString())
    delete balances[key]
    api.removeTokenBalance(WRAPPED_NATIVE)
    api.add(ADDRESSES.arc.USDC, raw / 10n ** 12n)
  }
  return api.getBalances()
}

module.exports = {
  methodology: 'TVL is the token balances held by the pools created by the Kaleido V3 factory on Arc.',
  start: 1789855914, // 2026-09-19
  arc: { tvl },
}
