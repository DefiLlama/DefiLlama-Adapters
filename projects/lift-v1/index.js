const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// LaunchpadFactory generations; the first no longer launches, its pools still trade
const FACTORIES = [
  '0x81daBcDbDca5a58B89967F28A3e6bD1677ca159c',
  '0x3f29dD25D1F6ad3D09d1d4A880F8a869E3039153',
]
const FROM_BLOCK = 19898213
const POSITION_MANAGER = '0x39654A85A4C05127f5Fd6ED22CAeC077A0fB1377' // Uniswap V3 NonfungiblePositionManager on Arc

const TOKEN_LAUNCHED = 'event TokenLaunched(address indexed token, address indexed creator, address indexed pool, address quote, uint256 positionId, uint160 sqrtPriceX96, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 initialBuyE6, string name, string symbol, string metadataURI)'

async function tvl(api) {
  const launches = []
  for (const factory of FACTORIES)
    launches.push(...await getLogs2({ api, target: factory, eventAbi: TOKEN_LAUNCHED, fromBlock: FROM_BLOCK, extraKey: 'lift-v1-launches' }))

  // only the launch positions held by the LpVaults are counted, and only their quote side
  return sumTokens2({
    api,
    uniV3WhitelistedTokens: [...new Set(launches.map((l) => l.quote))],
    uniV3ExtraConfig: { nftAddress: POSITION_MANAGER, positionIds: launches.map((l) => String(l.positionId)) },
  })
}

module.exports = {
  methodology: 'TVL is the quote side (USDC or EURC) of the launch position of every Uniswap V3 pool opened through the LIFT LaunchpadFactory generations. Each launch mints its whole token supply into one single-sided position whose NFT goes to an LpVault that has no function to move it, so what buyers pay in stays in the pool. Positions are valued from their liquidity, tick range and the pool price; uncollected swap fees, liquidity added by third parties and launched tokens are not counted.',
  start: '2026-09-09',
  doublecounted: true, // the same pools are counted by the Uniswap V3 adapter on arc
  arc: { tvl },
}
