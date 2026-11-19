const { getLogs2 } = require('../helper/cache/getLogs')

const FACTORY = '0x0E54a12dB2d6B8f309269ef98f8b9c2764aa3A92'
const GRADUATION_ROUTER = '0x5eCC1aB2CA5e11629fcE19495669dFbE0E78C3d4'
const LIQUIDITY_VAULT = '0x4c693C74eDf24520154D5AC0AF35a8aB5530B663'
const fromBlock = 66552064
const GRADUATED = 3

async function tvl(api) {
  const curves = await getLogs2({ api, target: FACTORY, fromBlock, eventAbi: 'event CurveCreated(address indexed curve, address indexed token, address indexed quoteToken, address creator, uint256 curveAllocation, uint256 liquidityReserve, uint256 startingPrice, uint256 slope, uint256 graduationThreshold, uint8 tokenDecimals)' })
  const curveAddresses = curves.map(i => i.curve)
  const states = await api.multiCall({ abi: 'uint8:curveState', calls: curveAddresses })
  const quoteReserves = await api.multiCall({ abi: 'uint256:quoteReserve', calls: curveAddresses })
  // active curves: only the quote side, relaunched-token inventory is excluded
  curves.forEach(({ quoteToken }, i) => {
    if (Number(states[i]) !== GRADUATED) api.add(quoteToken, quoteReserves[i])
  })

  // graduated curves: quote-side share of the LP held by the liquidity vault
  const seeded = await getLogs2({ api, target: GRADUATION_ROUTER, fromBlock, eventAbi: 'event LiquiditySeeded(address indexed curve, address indexed pair, address indexed token, address quoteToken, uint256 tokenAmount, uint256 quoteAmount, uint256 liquidity)' })
  const pairs = seeded.map(i => i.pair)
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pairs })
  const reserves = await api.multiCall({ abi: 'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32)', calls: pairs })
  const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: pairs })
  const vaultBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: pairs.map(pair => ({ target: pair, params: LIQUIDITY_VAULT })) })
  seeded.forEach(({ quoteToken }, i) => {
    if (+supplies[i] === 0) return
    const quoteReserve = token0s[i].toLowerCase() === quoteToken.toLowerCase() ? reserves[i].reserve0 : reserves[i].reserve1
    api.add(quoteToken, BigInt(quoteReserve) * BigInt(vaultBalances[i]) / BigInt(supplies[i]))
  })
}

module.exports = {
  methodology: 'Counts the quote assets committed to DaWabLauncher markets on Robinhood Chain. Active bonding curves count their quoteReserve. Graduated markets count the quote-token share of the AMM liquidity represented by LP tokens held by the protocol liquidity vault. Relaunched-token inventory and protocol fees are excluded.',
  start: '2026-09-18',
  robinhood: { tvl },
}
