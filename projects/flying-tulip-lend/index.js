const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const { ASSET_STATE_ABI, isSharedReserve, getSharedAllocation } = require('../flying-tulip-ftusd/shared')

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
    // { token: '0xF7D85EC4E7710f71992752eac2111312e73E9C9C', wrapper: '0xc67D966f761e8cf13Faa0a1E774425290c8453d9' }, // ftUSD -> ftFtUSD - excluded to prevent flying-tulip-ftusd double count
  ],
  bsc: [
    // startBlock is each wrapper's first on-chain code block. Later markets
    // must not be called during historical TVL replay before deployment.
    { token: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', wrapper: '0x39285FA9992A3A87e1C2e1476C1404E2cfdD1931', startBlock: 115757612 }, // USDC
    { token: '0x55d398326f99059fF775485246999027B3197955', wrapper: '0xFe040BEeF432FB924f871e9C76180b557a13533c', startBlock: 115757648 }, // USDT
    { token: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', wrapper: '0xa07adCaFc7709685836CF357Fa537AE2B3061156', startBlock: 115757623 }, // WBNB
    { token: '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409', wrapper: '0x41CB54680d1Baa26b85bc97641854E59964dBe38', startBlock: 115757660 }, // FDUSD
    { token: '0x77734e70b6E88b4d82fE632a168EDf6e700912b6', wrapper: '0x2D3587Fbd9A8fD4d4dD76e0102BC0063776E5BF6', startBlock: 115757635 }, // asBNB
    { token: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', wrapper: '0x5625ad05ED1031dCEFf37B3383fDd17b202A4f74', startBlock: 124580546 }, // ETH
    { token: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', wrapper: '0x440BE5Cb3663c8d33FD29D5FcF1ad78D684e4DCd', startBlock: 124580833 }, // BTCB
    { token: '0xa2E3356610840701BDf5611a53974510Ae27E2e1', wrapper: '0xfCcE797c51dA526156B14FAa6a9d0e44AF570a62', startBlock: 124580558 }, // wBETH
    { token: '0x205812CdBed920aFf76C6580abD681a46D11efc7', wrapper: '0xee62f248C22F279A39252727E0A17052D85ac7f6', startBlock: 124581107 }, // QQQB
  ],
}

const LENDING_LENS = {
  sonic: '0x3682168023e6ba8d1f995fda1d920827c5a8a43e',
  ethereum: '0x3682168023e6ba8d1f995fda1d920827c5a8a43e', // CREATE2 deterministic, same as Sonic
  bsc: '0xc374d2aE274f31bf53C561d0b4024136cC692f48',
}

function activeReserves(api) {
  const reserves = RESERVES[api.chain] || []
  if (api.block == null) return reserves
  const block = Number(api.block)
  return Number.isFinite(block) ? reserves.filter(r => !r.startBlock || block >= r.startBlock) : reserves
}

async function tvl(api) {
  const reserves = activeReserves(api)
  if (!reserves.length) return api.getBalances()

  // Shared reserve cash is allocated to ftUSD first. Other reserves retain
  // their wrapper/receipt accounting; borrowed funds remain a separate metric.
  const otherReserves = reserves.filter(r => !isSharedReserve(api.chain, r.token))
  const strategyLists = await Promise.all(otherReserves.map(({ wrapper: target }) => api.fetchList({
    target,
    lengthAbi: 'uint256:numberOfStrategies',
    itemAbi: 'function strategies(uint256) view returns (address)',
  })))
  const strategies = strategyLists.flat()

  const positions = strategies.length
    ? await api.multiCall({ abi: 'address:positionToken', calls: strategies.map(target => ({ target })) })
    : []

  const tokensAndOwners = [
    ...otherReserves.map(r => [r.token, r.wrapper]),
    ...strategies.map((s, i) => [positions[i], s]),
  ]
  await sumTokens2({ api, tokensAndOwners })

  for (const { token } of reserves) {
    if (!isSharedReserve(api.chain, token)) continue
    const allocation = await getSharedAllocation(api, token)
    api.add(token, allocation.lend)
  }
}

async function borrowed(api) {
  const reserves = activeReserves(api)
  if (!reserves.length) return api.getBalances()
  const states = await api.multiCall({
    target: LENDING_LENS[api.chain],
    abi: ASSET_STATE_ABI,
    calls: reserves.map(r => r.token),
  })
  reserves.forEach((r, i) => api.add(r.token, states[i].borrows.toString()))
}

module.exports = {
  methodology:
    'TVL: independent reserves sum wrapper underlying plus external strategy receipts. For USDC/USDT reserves shared with ftUSD, LendingLens cash is assigned to ftUSD up to its strategy claim and only the residual is assigned to Lend. Borrowed is outstanding debt reported separately via LendingLens.assetState.borrows.',
  sonic: { tvl, borrowed },
  ethereum: { tvl, borrowed },
  bsc: { tvl, borrowed, start: '2026-08-13' },
}
