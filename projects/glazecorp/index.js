const { getLogs2 } = require('../helper/cache/getLogs')

// Launchpad creates every fund: a Coin, a Fund that holds the backing, a Mine, a Resonance and strategy Auctions.
const LAUNCHPAD = '0x6ff3828435e96E343678E58F4677Da1dcEEE0C17'
const fromBlock = 100771402

const launchAbi = 'function getLaunch(uint256) view returns ((uint256 launchId, uint256 creatorNonce, address originalCreator, address controller, address coin, address fund, address signalCoin, address resonance, address resonanceRouter, address mine, address pool, address baseToken, uint24 swapFee, bytes32 poolId, address[] paymentTokens, address[] auctions, address[] bribes, address[] bribeRouters, uint256 baseSeedAmount, uint256 coinSeedAmount, uint256 creatorCoinAmount, uint256 depositedBaseAmount, uint256 depositedCoinAmount, uint256 burnedCoinDust, uint256 genesisShares, uint160 sqrtPriceX96, bool autoSignalCreator, bool receiveSwapFees, uint256[] creatorSignalAmounts, uint256[] initialAuctionPrices))'
const strategyAddedEvent = 'event StrategyAdded(address indexed strategy, address indexed bribe, address indexed bribeRouter, address paymentToken)'
const signalAddedEvent = 'event SignalAdded(address indexed account, address indexed strategy, uint256 amount)'
const feeRecipientSetEvent = 'event ProtocolFeeRecipientSet(address indexed previousRecipient, address indexed newRecipient)'
const ZERO = '0x0000000000000000000000000000000000000000'

async function tvl(api) {
  const count = await api.call({ target: LAUNCHPAD, abi: 'uint256:launchCount' })
  const ids = Array.from({ length: Number(count) }, (_, i) => i + 1)
  const launches = await api.multiCall({ target: LAUNCHPAD, abi: launchAbi, calls: ids })
  // Mining payments and fund revenue are always in USDG, even for funds whose pool uses another base token
  const usdg = await api.call({ target: LAUNCHPAD, abi: 'address:usdg' })

  // Strategies added after launch, and every account that has signaled a strategy, per fund
  const added = await Promise.all(launches.map(l => getLogs2({ api, target: l.resonance, eventAbi: strategyAddedEvent, fromBlock, extraKey: 'strategy-added' })))
  const signals = await Promise.all(launches.map(l => getLogs2({ api, target: l.resonance, eventAbi: signalAddedEvent, fromBlock, extraKey: 'signal-added' })))

  // Strategies can accept any token, so every fund's own coin and Uniswap v4 LP wrapper is excluded everywhere
  const excluded = new Set(launches.flatMap(l => [l.coin, l.pool]).map(a => a.toLowerCase()))
  const isCounted = token => !excluded.has(token.toLowerCase())

  const tokensAndOwners = []
  const bribes = [] // { bribe, signalers }
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
      const signalers = [...new Set(signals[i].filter(e => e.strategy.toLowerCase() === s.auction.toLowerCase()).map(e => e.account))]
      bribes.push({ bribe: s.bribe, signalers })
    })
  })

  // Creators choose fund assets freely, so one token that cannot report a balance must not stop TVL for every fund
  await api.sumTokens({ tokensAndOwners, permitFailure: true })

  // Bribes: only rewards signalers can claim plus rewards still scheduled to stream. Rewards that streamed while
  // nobody was signaling stay in the Bribe but can never be claimed, so the raw balance is not used.
  const rewardTokens = await api.multiCall({ abi: 'address[]:rewardTokens', calls: bribes.map(b => b.bribe), permitFailure: true })
  const remainingCalls = []
  const earnedCalls = []
  bribes.forEach((b, i) => (rewardTokens[i] || []).filter(isCounted).forEach(token => {
    remainingCalls.push({ target: b.bribe, params: [token], token })
    b.signalers.forEach(account => earnedCalls.push({ target: b.bribe, params: [account, token], token }))
  }))
  const remaining = await api.multiCall({ abi: 'function remainingReward(address) view returns (uint256)', calls: remainingCalls, permitFailure: true })
  const earned = await api.multiCall({ abi: 'function earned(address, address) view returns (uint256)', calls: earnedCalls, permitFailure: true })
  remainingCalls.forEach((c, i) => api.add(c.token, remaining[i] || 0))
  earnedCalls.forEach((c, i) => api.add(c.token, earned[i] || 0))

  // Mine: unclaimed USDG payouts owed to outgoing miners and creators. The protocol's own unclaimed fees are not user
  // TVL; they are owed to the current or any past Launchpad fee recipient, which are protocol contracts that never mine.
  const recipientLogs = await getLogs2({ api, target: LAUNCHPAD, eventAbi: feeRecipientSetEvent, fromBlock, extraKey: 'fee-recipient-set' })
  const current = await api.call({ target: LAUNCHPAD, abi: 'address:protocolFeeRecipient' })
  const recipients = [...new Set([current, ...recipientLogs.flatMap(l => [l.previousRecipient, l.newRecipient])].map(a => a.toLowerCase()))].filter(a => a !== ZERO)

  const mines = launches.map(l => l.mine)
  const claimable = await api.multiCall({ abi: 'uint256:totalClaimablePayments', calls: mines })
  const protocolClaims = await api.multiCall({ abi: 'function claimablePayment(address) view returns (uint256)', calls: mines.flatMap(target => recipients.map(params => ({ target, params: [params] }))) })
  mines.forEach((_, i) => {
    const protocolOwed = protocolClaims.slice(i * recipients.length, (i + 1) * recipients.length).reduce((sum, v) => sum + BigInt(v), 0n)
    api.add(usdg, BigInt(claimable[i]) - protocolOwed)
  })
}

module.exports = {
  methodology: 'TVL counts the assets held by each GlazeCorp fund (redeemable by fund coin holders), USDG waiting to buy assets in each fund\'s revenue router, Resonance stream and strategy auctions, bribe rewards that signalers can claim or that are still scheduled to stream, and unclaimed miner and creator payouts held by each Mine. Fund coins and fund pool liquidity are excluded; pool liquidity sits in Uniswap v4 and is counted there.',
  start: '2026-10-29',
  robinhood: { tvl },
}
