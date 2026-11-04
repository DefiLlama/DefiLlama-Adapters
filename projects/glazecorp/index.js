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
  const protocolFeeRecipient = await api.call({ target: LAUNCHPAD, abi: 'address:protocolFeeRecipient' })

  // Strategies added after launch, per fund
  const added = await Promise.all(launches.map(l => getLogs2({ api, target: l.resonance, eventAbi: strategyAddedEvent, fromBlock })))

  const tokensAndOwners = []
  launches.forEach((l, i) => {
    const excluded = new Set([l.coin, l.pool].map(a => a.toLowerCase())) // the fund's own coin and its Uniswap v4 LP wrapper
    const strategies = l.auctions.map((auction, j) => ({ auction, bribe: l.bribes[j], bribeRouter: l.bribeRouters[j], paymentToken: l.paymentTokens[j] }))
    added[i].forEach(s => strategies.push({ auction: s.strategy, bribe: s.bribe, bribeRouter: s.bribeRouter, paymentToken: s.paymentToken }))

    // Fund backing: every asset the fund buys plus the base token, redeemable by coin holders
    const fundTokens = new Set([l.baseToken, ...strategies.map(s => s.paymentToken)].filter(t => !excluded.has(t.toLowerCase())))
    fundTokens.forEach(token => tokensAndOwners.push([token, l.fund]))

    // Base token on its way to buy assets: revenue router, the 7-day Resonance stream and the strategy Auctions
    ;[l.resonanceRouter, l.resonance, ...strategies.map(s => s.auction)].forEach(owner => tokensAndOwners.push([l.baseToken, owner]))

    // Bribe share of auction payments, owed to signalers
    strategies.forEach(s => {
      if (excluded.has(s.paymentToken.toLowerCase())) return
      tokensAndOwners.push([s.paymentToken, s.bribe], [s.paymentToken, s.bribeRouter])
    })
  })
  // Creators choose fund assets freely, so one token that cannot report a balance must not stop TVL for every fund
  await api.sumTokens({ tokensAndOwners, permitFailure: true })

  // Mine: unclaimed payouts owed to outgoing miners and creators; the protocol's own unclaimed fee is not user TVL
  const mines = launches.map(l => l.mine)
  const mineBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: launches.map(l => ({ target: l.baseToken, params: [l.mine] })) })
  const protocolClaims = await api.multiCall({ abi: 'function claimablePayment(address) view returns (uint256)', calls: mines.map(target => ({ target, params: [protocolFeeRecipient] })) })
  launches.forEach((l, i) => api.add(l.baseToken, BigInt(mineBalances[i]) - BigInt(protocolClaims[i])))
}

module.exports = {
  methodology: 'TVL counts the assets held by each GlazeCorp fund (redeemable by fund coin holders), USDG waiting to buy assets in each fund\'s revenue router, Resonance stream and strategy auctions, bribe balances owed to signalers, and unclaimed miner and creator payouts held by each Mine. Fund coins and fund pool liquidity are excluded; pool liquidity sits in Uniswap v4 and is counted there.',
  start: '2026-10-29',
  robinhood: { tvl },
}
