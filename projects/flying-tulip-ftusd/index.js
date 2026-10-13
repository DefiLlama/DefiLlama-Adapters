const { sumTokens2 } = require('../helper/unwrapLPs')
const { SHARED_RESERVES, GET_BALANCE_ABI, isSharedReserve, getSharedAllocation } = require('./shared')

const MINT_AND_REDEEM = {
  ethereum: '0xaa48ecbc843cf7e9a29155d112b8cb27902bd23c',
  sonic: '0x0c6f8ec81c3ea5bff06f6cd0791780f9f050ee31',
  bsc: '0x7d73863178A3eCb9767F0BE1bf50F55305A52743',
}

const COLLATERAL_INFO_ABI =
  'function collateralInfo(address) view returns (tuple(address yieldWrapper, uint8 decimals, bool enabled, uint16 mintFeeBps, uint16 redeemFeeBps, uint256 maxValueFtUSD, uint256 mintPriceHardcapWad, uint256 totalIn, uint256 totalOut, uint256 totalFtUSDBurned, uint256 totalFtUSDMinted))'

async function tvl(api) {
  const mr = MINT_AND_REDEEM[api.chain]
  const collaterals = await api.fetchList({
    target: mr,
    lengthAbi: 'uint256:collateralCount',
    itemAbi: 'function collateralAt(uint256) view returns (address)',
  })
  const wrappers = (await api.multiCall({ target: mr, abi: COLLATERAL_INFO_ABI, calls: collaterals }))
    .map(i => i.yieldWrapper)

  const strategyLists = await Promise.all(wrappers.map(target => api.fetchList({
    target,
    lengthAbi: 'uint256:numberOfStrategies',
    itemAbi: 'function strategies(uint256) view returns (address)',
  })))
  const flat = strategyLists.flatMap((strats, i) => strats.map(strategy => ({ strategy, wrapper: wrappers[i], token: collaterals[i] })))

  for (let i = 0; i < collaterals.length; i++) {
    const idle = await api.call({ target: collaterals[i], abi: 'erc20:balanceOf', params: [wrappers[i]] })
    api.add(collaterals[i], idle)
  }

  const shared = SHARED_RESERVES[api.chain]
  const external = []
  for (const { strategy, wrapper, token } of flat) {
    if (strategy.toLowerCase() !== shared?.strategy.toLowerCase()) {
      external.push({ strategy, wrapper })
      continue
    }

    const strategyIdle = await api.call({ target: token, abi: 'erc20:balanceOf', params: [strategy] })
    api.add(token, strategyIdle)
    if (isSharedReserve(api.chain, token)) {
      const allocation = await getSharedAllocation(api, token)
      api.add(token, allocation.ftusd)
    } else {
      const pmBalance = await api.call({
        target: shared.positionManager,
        abi: GET_BALANCE_ABI,
        params: [strategy, token],
      })
      api.add(token, pmBalance.avail ?? pmBalance[0])
    }
  }

  if (!external.length) return api.getBalances()

  const [positions, underlyings] = await Promise.all([
    api.multiCall({ abi: 'address:positionToken', calls: external.map(s => ({ target: s.strategy })), permitFailure: true }),
    api.multiCall({ abi: 'address:token',         calls: external.map(s => ({ target: s.strategy })), permitFailure: true }),
  ])

  const tokensAndOwners = []
  for (let i = 0; i < external.length; i++) {
    const { strategy, wrapper } = external[i]
    if (!positions[i] || !underlyings[i]) {
      const shares = await api.call({ target: strategy, abi: 'erc20:balanceOf', params: [wrapper] })
      if (BigInt(shares) > 0n) throw new Error(`Funded ftUSD strategy has unreadable position metadata: ${strategy}`)
      continue
    }
    tokensAndOwners.push(positions[i].toLowerCase() !== underlyings[i].toLowerCase()
      ? [positions[i], strategy]
      : [strategy, wrapper])
  }

  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'Counts idle collateral in each MintAndRedeem wrapper and strategy, plus external strategy receipts. For Flying Tulip shared strategies, counts the collateral held in Lend up to the lesser of the strategy claim and reserve cash; Lend counts only residual cash. Borrowed funds are separate from TVL.',
  ethereum: { tvl },
  sonic: { tvl },
  bsc: { tvl },
}
