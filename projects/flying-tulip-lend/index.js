const { sumTokens2 } = require('../helper/unwrapLPs')

const RESERVES = {
  sonic: [
    { token: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894', wrapper: '0x7a2fd34e4cc4c8b1023576a3f3d1f7aa36cf8b47' }, // USDC -> ftUSDC
    { token: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38', wrapper: '0xbb155f15d8452139d1a9c3a664847d2f8314c18e' }, // wS   -> ftwS  
    { token: '0x5DD1A7A369e8273371d2DBf9d83356057088082c', wrapper: '0x7127bb9d9ad0f47b8da9087e634d67f3946f840e' }, // FT   -> ftFT
    { token: '0xE5DA20F15420aD15DE0fa650600aFc998bbE3955', wrapper: '0x8b98e46421898437862de44aa63b73b2da69147b' }, // stS  -> ftstS
    { token: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', wrapper: '0xd6587e78d252e630d425ecd827017bf81b0ac553' }, // WBTC  -> ftWBTC
    { token: '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b', wrapper: '0x727bc187150d5599e7fba32732c21c6d9f5b1837' }, // WETH  -> ftWETH
    // ftUSD is intentionally excluded
  ],
}

const LENDING_LENS = {
  sonic: '0x3682168023e6ba8d1f995fda1d920827c5a8a43e',
}

const ASSET_STATE_ABI =
  'function assetState(address) view returns (uint256 cash, uint256 borrows, uint256 reserves, uint256 utilWad)'

async function tvl(api) {
  const reserves = RESERVES[api.chain] || []

  // Get list of strategies for each wrapper
  const strategyLists = await Promise.all(reserves.map(({ wrapper: target }) => api.fetchList({
    target,
    lengthAbi: 'uint256:numberOfStrategies',
    itemAbi: 'function strategies(uint256) view returns (address)',
  })))
  const strategies = strategyLists.flat()

  // Each strategy exposes positionToken() (aToken, spToken, etc.)
  const positions = strategies.length
    ? await api.multiCall({ abi: 'address:positionToken', calls: strategies.map(target => ({ target })) })
    : []

  const tokensAndOwners = [
    // Idle underlying held by the wrapper
    ...reserves.map(r => [r.token, r.wrapper]),
    // Yield receipt held by each strategy
    ...strategies.map((s, i) => [positions[i], s]),
  ]

  return sumTokens2({ api, tokensAndOwners })
}

async function borrowed(api) {
  const reserves = RESERVES[api.chain] || []
  const states = await api.multiCall({
    target: LENDING_LENS[api.chain],
    abi: ASSET_STATE_ABI,
    calls: reserves.map(r => r.token),
  })
  reserves.forEach((r, i) => api.add(r.token, states[i].borrows.toString()))
}

module.exports = {
  methodology:
    'TVL: for each Lend reserve, sums the underlying balance held at its ftYieldWrapperV2 plus the yield receipt (aToken, spToken, etc.) held by each of the wrapper\'s strategies. Borrowed: sums outstanding debt per reserve via LendingLens.assetState.borrows since per-borrower balances are not enumerable on-chain. ftUSD reserve is intentionally excluded to avoid double-counting with the ftUSD adapter.',
  sonic: { tvl, borrowed },
}