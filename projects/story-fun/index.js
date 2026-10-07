const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Story.fun is a token launchpad on Robinhood Chain. Every launch gets its own bonding curve that
// custodies the quote asset buyers pay in. When a curve sells out the launch graduates: its reserves
// are minted as a full-range Uniswap V4 position and the position NFT is locked forever in the
// LiquidityLocker, so graduated liquidity never leaves the protocol.
//
// Only the quote side is counted. A curve's launch-token balance is unsold supply, and the
// launch-token side of a graduated pool is priced by that same pool, so counting either would report
// the launchpad's own emissions as value locked.
const config = {
  robinhood: {
    factory: '0x1A9BC7Fd7EE06Fa0477781633223bcC102C08fbd',
    receiver: '0x011Df5b627D386B72da589ceAbAE0915Ae0DdEC9',
    locker: '0x849187b6C1D2Ab47012689E91C4b0Ec025991D33',
    // LaunchFactory deployment block
    fromBlock: 75644816,
  },
}

const TOKEN_LAUNCHED = 'event TokenLaunched(address indexed token, address indexed curve, address indexed creator, bytes32 launchSalt, address quoteAsset, bytes32 quoteConfigHash, uint32 launchConfigId, uint16 curveFeeBps, int24 tickSpacing, address creatorFeeRecipient, uint16 creatorTaxBps, bool buybackEnabled, string name, string symbol, string logo, string description, (string,string,string,string,string,string) socials)'
const V4_POOL_GRADUATED = 'event V4PoolGraduated(address indexed token, address indexed curve, bytes32 indexed poolId, uint256 positionId, uint160 sqrtPriceX96, uint128 liquidity, uint128 quoteAmount, uint96 tokenAmount, uint96 tokenDust, uint256 quoteDust)'

async function tvl(api) {
  const { factory, receiver, locker, fromBlock } = config[api.chain]

  const launches = await getLogs2({ api, factory, eventAbi: TOKEN_LAUNCHED, fromBlock })
  const graduations = await getLogs2({ api, target: receiver, eventAbi: V4_POOL_GRADUATED, fromBlock })

  // every quote asset the factory has ever launched against; native ETH is the zero address
  const quoteAssets = [...new Set(launches.map((log) => log.quoteAsset.toLowerCase()))]

  // a graduated curve has handed everything to the receiver, so only live curves are worth reading
  const graduated = new Set(graduations.map((log) => log.curve.toLowerCase()))
  const ownerTokens = launches
    .filter((log) => !graduated.has(log.curve.toLowerCase()))
    .map((log) => [[log.quoteAsset], log.curve])

  // reserves the factory isolated from a curve that sold out but whose pool creation has not settled yet
  ownerTokens.push([quoteAssets, factory])
  await sumTokens2({ api, ownerTokens })

  const positionIds = [...new Set(graduations.map((log) => log.positionId.toString()))]
  if (positionIds.length)
    await sumTokens2({ api, owner: locker, uniV4ExtraConfig: { positionIds, whitelistedTokens: quoteAssets } })

  return api.getBalances()
}

module.exports = {
  // graduated liquidity sits in the Uniswap V4 PoolManager and is already counted as Uniswap V4 TVL
  doublecounted: true,
  methodology:
    'Counts the quote asset (native ETH) held by every live Story.fun bonding curve, the reserves a sold-out curve has handed to the LaunchFactory while its pool is being created, and the quote side of the full-range Uniswap V4 positions permanently locked in the LiquidityLocker after graduation. Launch tokens are not counted: on a curve they are unsold supply, and in a graduated pool they are priced by that same pool.',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
