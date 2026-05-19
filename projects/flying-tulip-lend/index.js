const { sumTokens2 } = require('../helper/unwrapLPs')

const RESERVES = {
  sonic: [
    { token: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894', wrapper: '0x7a2fd34e4cc4c8b1023576a3f3d1f7aa36cf8b47' }, // USDC -> ftUSDC
    { token: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38', wrapper: '0xbb155f15d8452139d1a9c3a664847d2f8314c18e' }, // wS   -> ftwS
    { token: '0x5DD1A7A369e8273371d2DBf9d83356057088082c', wrapper: '0x7127bb9d9ad0f47b8da9087e634d67f3946f840e' }, // FT   -> ftFT
    { token: '0xE5DA20F15420aD15DE0fa650600aFc998bbE3955', wrapper: '0x8b98e46421898437862de44aa63b73b2da69147b' }, // stS  -> ftstS
    { token: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', wrapper: '0xd6587e78d252e630d425ecd827017bf81b0ac553' }, // WBTC  -> ftWBTC
    { token: '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b', wrapper: '0x727bc187150d5599e7fba32732c21c6d9f5b1837' }, // WETH  -> ftWETH
    { token: '0x000000000eccff26b795f73fb0a70d48da657fef', wrapper: '0x0e794B1FD35A7a5550CD3E305882369FFB2DF7f7' }, // USSD -> ftUSSD
    { token: '0xF7D85EC4E7710f71992752eac2111312e73E9C9C', wrapper: '0xc67D966f761e8cf13Faa0a1E774425290c8453d9' }, // ftUSD -> ftFtUSD
  ],
  ethereum: [
    { token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', wrapper: '0xD2e4A5ac4B4Da102317cF7C9A1289aDF082639E2' }, // USDC -> ftUSDC
    { token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', wrapper: '0x28b0905d83BCe5FFA6c54651F25858828A38123B' }, // USDT -> ftUSDT
    { token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', wrapper: '0x460494aF61BcB92B59797B4e09C26A5ADecb2da2' }, // WETH -> ftWETH (wNative)
    { token: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', wrapper: '0x1A5730c71576D77048E9FdC79DD40e4B1E8Fe042' }, // WBTC -> ftWBTC
    { token: '0x5DD1A7A369e8273371d2DBf9d83356057088082c', wrapper: '0x7127BB9d9ad0f47B8dA9087e634D67F3946F840E' }, // FT   -> ftFT
    { token: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', wrapper: '0x01980BD1B58313bD3767f6adc75Af8b6464f3db7' }, // wstETH -> ftWstETH (stakedNative)
    { token: '0xF7D85EC4E7710f71992752eac2111312e73E9C9C', wrapper: '0xc67D966f761e8cf13Faa0a1E774425290c8453d9' }, // ftUSD -> ftFtUSD
  ],
}

const LENDING_LENS = {
  sonic: '0x3682168023e6ba8d1f995fda1d920827c5a8a43e',
  ethereum: '0x3682168023e6ba8d1f995fda1d920827c5a8a43e', // CREATE2 deterministic, same as Sonic
}

const ASSET_STATE_ABI =
  'function assetState(address) view returns (uint256 cash, uint256 borrows, uint256 reserves, uint256 utilWad)'

async function tvl(api) {
  const reserves = RESERVES[api.chain] || []

  // Total supplied per reserve = cash + borrows.
  //
  // `cash` is the idle liquidity that still sits in the system, split between:
  //   - underlying held at the ftYieldWrapperV2 (not deployed yet)
  //   - yield receipt (aToken, spToken, ...) held at each of the wrapper's strategies
  //
  // `borrows` is the outstanding debt: tokens lent out to borrowers that have
  // left the wrapper. We have to add this back via LendingLens.assetState
  // otherwise the adapter under-reports TVL by the entire borrow book.

  // 1) cash side
  const strategyLists = await Promise.all(reserves.map(({ wrapper: target }) => api.fetchList({
    target,
    lengthAbi: 'uint256:numberOfStrategies',
    itemAbi: 'function strategies(uint256) view returns (address)',
  })))
  const strategies = strategyLists.flat()

  const positions = strategies.length
    ? await api.multiCall({ abi: 'address:positionToken', calls: strategies.map(target => ({ target })) })
    : []

  const tokensAndOwners = [
    ...reserves.map(r => [r.token, r.wrapper]),
    ...strategies.map((s, i) => [positions[i], s]),
  ]
  await sumTokens2({ api, tokensAndOwners })
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
    'TVL: for each Lend reserve, sums the underlying balance held at its ftYieldWrapperV2 plus the yield receipt (aToken, spToken, etc.) held by each of the wrapper\'s strategies. Borrowed: sums outstanding debt per reserve via LendingLens.assetState.borrows.',
  sonic: { tvl, borrowed },
  ethereum: { tvl, borrowed },
}
