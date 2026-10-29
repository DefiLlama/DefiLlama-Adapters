const { STHYPE, WHYPE } = require('../helper/valantis')

const STEX_STHYPE = '0x39694eFF3b02248929120c73F90347013Aec834d'
const STEX_KHYPE = '0xbf747D2959F03332dbd25249dB6f00F62c6Cb526'
const STEX_LENS = '0x95e88072c3fe908101a13584d7A0ff87DaDd88f3'
const NAV_ABI = 'function getTotalValueToken1(address) view returns (uint256)'

async function tvl(api) {
  const [sthypeValue, khypeValue, pool] = await api.batchCall([
    { target: STEX_LENS, abi: NAV_ABI, params: [STEX_STHYPE] },
    { target: STEX_LENS, abi: NAV_ABI, params: [STEX_KHYPE] },
    { target: STEX_STHYPE, abi: 'address:pool' },
  ])
  const reserves = await api.call({ target: pool, abi: 'function getReserves() view returns (uint256,uint256)' })
  const sthypeNav = BigInt(sthypeValue)
  const reserve0 = BigInt(reserves[0])
  // Keep live stHYPE visible for parent exclusions. Allocate liabilities to
  // native exposure first, capping stHYPE at NAV to avoid negative balances.
  const liveStHype = reserve0 < sthypeNav ? reserve0 : sthypeNav
  api.add(STHYPE, liveStHype.toString())
  api.add(WHYPE, (sthypeNav - liveStHype + BigInt(khypeValue)).toString())
}

module.exports = {
  start: '2025-04-02',
  doublecounted: true, // Lent WHYPE is also counted by HyperLend.
  methodology: 'Counts combined stHYPE and kHYPE STEX net LP assets using the existing lens, including lending and pending unstaking less withdrawal liabilities. Preserves live stHYPE separately for parent exclusions; lending overlaps HyperLend TVL.',
  hyperliquid: { tvl },
}
