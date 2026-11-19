const { getLogs2 } = require('../helper/cache/getLogs')

// Launchpad creates every fund: a Coin, a Fund that holds the backing, a Mine, a Resonance and strategy Auctions.
const LAUNCHPAD = '0x6ff3828435e96E343678E58F4677Da1dcEEE0C17'
const fromBlock = 100771402

const launchAbi = 'function getLaunch(uint256) view returns ((uint256 launchId, uint256 creatorNonce, address originalCreator, address controller, address coin, address fund, address signalCoin, address resonance, address resonanceRouter, address mine, address pool, address baseToken, uint24 swapFee, bytes32 poolId, address[] paymentTokens, address[] auctions, address[] bribes, address[] bribeRouters, uint256 baseSeedAmount, uint256 coinSeedAmount, uint256 creatorCoinAmount, uint256 depositedBaseAmount, uint256 depositedCoinAmount, uint256 burnedCoinDust, uint256 genesisShares, uint160 sqrtPriceX96, bool autoSignalCreator, bool receiveSwapFees, uint256[] creatorSignalAmounts, uint256[] initialAuctionPrices))'
const strategyAddedEvent = 'event StrategyAdded(address indexed strategy, address indexed bribe, address indexed bribeRouter, address paymentToken)'

async function tvl(api) {
  const count = await api.call({ target: LAUNCHPAD, abi: 'uint256:launchCount' })
  const ids = Array.from({ length: Number(count) }, (_, i) => i + 1)
  const launches = await api.multiCall({ target: LAUNCHPAD, abi: launchAbi, calls: ids })
  // Mining payments and fund revenue are always in USDG, even for funds whose pool uses another base token
  const usdg = await api.call({ target: LAUNCHPAD, abi: 'address:usdg' })

  // Strategies added after launch, per fund
  const added = []
  for (const l of launches)
    added.push(await getLogs2({ api, target: l.resonance, eventAbi: strategyAddedEvent, fromBlock, extraKey: 'strategy-added' }))

  // Strategies can accept any token, so every fund's own coin and Uniswap v4 LP wrapper is excluded everywhere
  const excluded = new Set(launches.flatMap(l => [l.coin, l.pool]).map(a => a.toLowerCase()))
  const isCounted = token => !excluded.has(token.toLowerCase())

  const tokensAndOwners = []
  const bribes = []
  launches.forEach((l, i) => {
    const strategies = l.auctions.map((auction, j) => ({ auction, bribe: l.bribes[j], bribeRouter: l.bribeRouters[j], paymentToken: l.paymentTokens[j] }))
    added[i].forEach(s => strategies.push({ auction: s.strategy, bribe: s.bribe, bribeRouter: s.bribeRouter, paymentToken: s.paymentToken }))

    // Fund backing: every asset the fund buys, plus its base token and USDG, redeemable by coin holders
    const fundTokens = new Set([l.baseToken, usdg, ...strategies.map(s => s.paymentToken)].filter(isCounted))
    fundTokens.forEach(token => tokensAndOwners.push([token, l.fund]))

    // USDG on its way to buy assets: revenue router, the 7-day Resonance stream and the strategy Auctions
    ;[l.resonanceRouter, l.resonance, ...strategies.map(s => s.auction)].forEach(owner => tokensAndOwners.push([usdg, owner]))

    strategies.forEach(s => {
      // Bribe share of auction payments, buffered in the BribeRouter before it streams to signalers
      if (isCounted(s.paymentToken)) tokensAndOwners.push([s.paymentToken, s.bribeRouter])
      bribes.push(s.bribe)
    })

    // Mine: unclaimed USDG payouts owed to outgoing miners and creators
    tokensAndOwners.push([usdg, l.mine])
  })

  // Bribes: rewards held for signalers
  const rewardTokens = await api.multiCall({ abi: 'address[]:rewardTokens', calls: bribes })
  bribes.forEach((bribe, i) => rewardTokens[i].filter(isCounted).forEach(token => tokensAndOwners.push([token, bribe])))

  // Creators choose fund assets freely, so one token that cannot report a balance must not stop TVL for every fund
  await api.sumTokens({ tokensAndOwners, permitFailure: true })
}

module.exports = {
  methodology: 'TVL counts the assets held by each GlazeCorp fund (redeemable by fund coin holders), USDG waiting to buy assets in each fund\'s revenue router, Resonance stream and strategy auctions, bribe rewards held for signalers, and unclaimed mining payouts held by each Mine. Fund coins and fund pool liquidity are excluded; pool liquidity sits in Uniswap v4 and is counted there.',
  start: '2026-10-29',
  robinhood: { tvl },
}
