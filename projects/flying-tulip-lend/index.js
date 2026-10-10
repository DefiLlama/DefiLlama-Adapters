const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const RESERVES = {
  sonic: [
    { token: ADDRESSES.sonic.USDC_e, wrapper: '0x7a2fd34e4cc4c8b1023576a3f3d1f7aa36cf8b47' }, // USDC -> ftUSDC
    { token: ADDRESSES.sonic.wS, wrapper: '0xbb155f15d8452139d1a9c3a664847d2f8314c18e' }, // wS   -> ftwS
    { token: '0x5DD1A7A369e8273371d2DBf9d83356057088082c', wrapper: '0x7127bb9d9ad0f47b8da9087e634d67f3946f840e' }, // FT   -> ftFT
    { token: ADDRESSES.sonic.STS, wrapper: '0x8b98e46421898437862de44aa63b73b2da69147b' }, // stS  -> ftstS
    { token: ADDRESSES.sonic.WBTC, wrapper: '0xd6587e78d252e630d425ecd827017bf81b0ac553' }, // WBTC  -> ftWBTC
    { token: '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b', wrapper: '0x727bc187150d5599e7fba32732c21c6d9f5b1837' }, // WETH  -> ftWETH
    { token: '0x000000000eccff26b795f73fb0a70d48da657fef', wrapper: '0x0e794B1FD35A7a5550CD3E305882369FFB2DF7f7' }, // USSD -> ftUSSD
    // { token: '0xF7D85EC4E7710f71992752eac2111312e73E9C9C', wrapper: '0xc67D966f761e8cf13Faa0a1E774425290c8453d9' }, // ftUSD -> ftFtUSD - excluded to prevent flying-tulip-ftusd double count
  ],
  ethereum: [
    { token: ADDRESSES.ethereum.USDC, wrapper: '0xD2e4A5ac4B4Da102317cF7C9A1289aDF082639E2' }, // USDC -> ftUSDC
    { token: ADDRESSES.ethereum.USDT, wrapper: '0x28b0905d83BCe5FFA6c54651F25858828A38123B' }, // USDT -> ftUSDT
    { token: ADDRESSES.ethereum.WETH, wrapper: '0x460494aF61BcB92B59797B4e09C26A5ADecb2da2' }, // WETH -> ftWETH (wNative)
    { token: ADDRESSES.ethereum.WBTC, wrapper: '0x1A5730c71576D77048E9FdC79DD40e4B1E8Fe042' }, // WBTC -> ftWBTC
    { token: '0x5DD1A7A369e8273371d2DBf9d83356057088082c', wrapper: '0x7127BB9d9ad0f47B8dA9087e634D67F3946F840E' }, // FT   -> ftFT
    { token: ADDRESSES.ethereum.WSTETH, wrapper: '0x01980BD1B58313bD3767f6adc75Af8b6464f3db7' }, // wstETH -> ftWstETH (stakedNative)
    { token: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e', wrapper: '0xa41686c6018056b44a7027f4c912e6153cfb5c63' }, // crvUSD -> ftcrvUSD
    { token: '0x0655977feb2f289a4ab78af67bab0d17aab84367', wrapper: '0xefab1b1856bbe0b6d78f2552614e34efad1eb6c6' }, // scrvUSD -> ftscrvUSD
    { token: ADDRESSES.ethereum.USDG, wrapper: '0x8b419a64d95738b3dfcb55a35da7918dfd366bb0' }, // USDG -> ftUSDG
    { token: ADDRESSES.ethereum.sUSDe, wrapper: '0xbc940f911744670523c3d4ebc56e1e28489591d7' }, // sUSDe -> ftsUSDe
    // { token: '0xF7D85EC4E7710f71992752eac2111312e73E9C9C', wrapper: '0xc67D966f761e8cf13Faa0a1E774425290c8453d9' }, // ftUSD -> ftFtUSD - excluded to prevent flying-tulip-ftusd double count
  ],
  bsc: [
    { token: ADDRESSES.bsc.USDC, wrapper: '0x39285fa9992a3a87e1c2e1476c1404e2cfdd1931' }, // USDC -> ftUSDC
    { token: ADDRESSES.bsc.USDT, wrapper: '0xfe040beef432fb924f871e9c76180b557a13533c' }, // USDT -> ftUSDT
    { token: ADDRESSES.bsc.WBNB, wrapper: '0xa07adcafc7709685836cf357fa537ae2b3061156' }, // WBNB -> ftWBNB (wNative)
    { token: '0x77734e70b6e88b4d82fe632a168edf6e700912b6', wrapper: '0x2d3587fbd9a8fd4d4dd76e0102bc0063776e5bf6' }, // asBNB -> ftasBNB (stakedNative)
    { token: ADDRESSES.bsc.FDUSD, wrapper: '0x41cb54680d1baa26b85bc97641854e59964dbe38' }, // FDUSD -> ftFDUSD
    { token: '0x2170ed0880ac9a755fd29b2688956bd959f933f8', wrapper: '0x5625ad05ed1031dceff37b3383fdd17b202a4f74' }, // ETH -> ftETH
    { token: ADDRESSES.bsc.BTCB, wrapper: '0x440be5cb3663c8d33fd29d5fcf1ad78d684e4dcd' }, // BTCB -> ftBTCB
    { token: '0xa2e3356610840701bdf5611a53974510ae27e2e1', wrapper: '0xfcce797c51da526156b14faa6a9d0e44af570a62' }, // wBETH -> ftwBETH
    { token: '0x205812cdbed920aff76c6580abd681a46d11efc7', wrapper: '0xee62f248c22f279a39252727e0a17052d85ac7f6' }, // QQQB -> ftQQQB
  ],
}

const LENDING_LENS = {
  sonic: '0x3682168023e6ba8d1f995fda1d920827c5a8a43e',
  ethereum: '0x3682168023e6ba8d1f995fda1d920827c5a8a43e', // CREATE2 deterministic, same as Sonic
  bsc: '0xc374d2ae274f31bf53c561d0b4024136cc692f48',
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
  // ftUSD backing that the Delta-Neutral strategies supply into Lend is counted
  // here only. flying-tulip-ftusd skips those strategies, so it is counted once.
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
    'TVL: for each Lend reserve, sums the underlying balance held at its ftYieldWrapperV2 plus the yield receipt (aToken, spToken, etc.) held by each of the wrapper\'s strategies. This includes collateral that ftUSD\'s Delta-Neutral strategies supply into Lend, which flying-tulip-ftusd does not count. ftUSD supplied into Lend is excluded so ftUSD backing is not counted twice. Borrowed: sums outstanding debt per reserve via LendingLens.assetState.borrows.',
  sonic: { tvl, borrowed },
  ethereum: { tvl, borrowed },
  bsc: { tvl, borrowed },
}
