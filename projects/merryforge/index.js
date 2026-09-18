const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, unwrapUniswapLPs } = require('../helper/unwrapLPs')

const LAUNCH_FACTORY = '0x3b5e8FE8d61B00b35e021275c96F754424b1B9A8'
const GRADUATION_ROUTER = '0x2a8F21ACa57873479CB0E73cd7D0dB22274B51A8'
const LIQUIDITY_LOCKER = '0xe376C24bB0351ff95Aa3fd76f967870Fa9eD82A4'
const BOND_VAULT = '0x889C3071CF406a1977e0Fb5A076fd893ed918f9D'

const START_BLOCK = 24875635 // MerryForgeLaunchFactory deploy block

const USDG = ADDRESSES.robinhood.USDG
const WETH = ADDRESSES.robinhood.WETH
const VIRTUAL = '0xc6911796042b15d7Fa4F6CDe69e245DdCd3d9c31'

// first-wave Stock Token native-raise quotes
const STOCK_NATIVE_RAISE = [
  '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', // AAPL
  '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
  '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA
  '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', // SPY
  '0xe93237C50D904957Cf27E7B1133b510C669c2e74', // MSFT
]

// all known raise / fee quote assets
const QUOTES = [USDG, WETH, VIRTUAL, ...STOCK_NATIVE_RAISE]

async function tvl(api) {
  const curves = await api.fetchList({ target: LAUNCH_FACTORY, lengthAbi: 'launchCount', itemAbi: 'launchCurve', startFromOne: true })
  const owners = [BOND_VAULT, ...curves.filter((c) => c && c !== ADDRESSES.null)]

  const tokens = await api.fetchList({ target: LAUNCH_FACTORY, lengthAbi: 'launchCount', itemAbi: 'launchToken', startFromOne: true })
  const poolAddrs = await api.multiCall({ target: GRADUATION_ROUTER, abi: 'function poolForToken(address) view returns (address)', calls: tokens, permitFailure: true })
  const pools = poolAddrs.filter((p) => p && p !== ADDRESSES.null)

  await sumTokens2({ api, owners, tokens: QUOTES })

  if (pools.length) {
    const lpBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: pools.map((p) => ({ target: p, params: [LIQUIDITY_LOCKER] })) })
    const lpPositions = pools.map((token, i) => ({ token, balance: lpBalances[i] }))
    await unwrapUniswapLPs(api.getBalances(), lpPositions, api.block, api.chain, null, tokens)
  }
}

module.exports = {
  methodology:
    'MerryForge TVL is raise-asset inventory in bonding curves, USDG in CreatorBondVault, and locked UniV2 LP (LiquidityLocker) from graduated launches. Excludes launch-token inventory, secondary pools, and fee revenue (FeeVault + protocolTreasury, tracked separately as treasury).',
  start: START_BLOCK,
  robinhood: { tvl },
}
