const { getLogs2 } = require('../helper/cache/getLogs')
const { sliceIntoChunks, sleep } = require('../helper/utils')

// LaunchpadFactory generations; the first no longer launches, its pools still trade
const FACTORIES = [
  '0x81daBcDbDca5a58B89967F28A3e6bD1677ca159c',
  '0x3f29dD25D1F6ad3D09d1d4A880F8a869E3039153',
]
const FROM_BLOCK = 19898213

const TOKEN_LAUNCHED = 'event TokenLaunched(address indexed token, address indexed creator, address indexed pool, address quote, uint256 positionId, uint160 sqrtPriceX96, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 initialBuyE6, string name, string symbol, string metadataURI)'

async function tvl(api) {
  const launches = []
  for (const factory of FACTORIES)
    launches.push(...await getLogs2({ api, target: factory, eventAbi: TOKEN_LAUNCHED, fromBlock: FROM_BLOCK, extraKey: 'lift-v1-launches' }))

  // the public Arc RPC rate-limits bursts of multicalls, so pools are read in paced slices
  for (const chunk of sliceIntoChunks(launches, 500)) {
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: chunk.map((l) => ({ target: l.quote, params: [l.pool] })) })
    api.addTokens(chunk.map((l) => l.quote), balances)
    await sleep(1000)
  }
}

module.exports = {
  methodology: 'TVL is the quote asset (USDC or EURC) held by every Uniswap V3 pool opened through the LIFT LaunchpadFactory generations. Each launch mints its whole token supply into one single-sided position whose NFT goes to an LpVault that has no function to move it, so what buyers pay in stays in the pool. Pool balances also include swap fees not yet harvested and any liquidity third parties add to these pools. Launched tokens are not counted.',
  start: '2026-09-09',
  doublecounted: true, // the same pools are counted by the Uniswap V3 adapter on arc
  arc: { tvl },
}
