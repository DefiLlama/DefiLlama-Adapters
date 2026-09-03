const { call } = require('../helper/chain/stacks-api')

const D = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG'

// PoX-5 migration cutover: stx-reserve-v2 deployed at block 8712010
const STX_V2_CUTOVER = 8712010
// stBTC reserve deployed at block 8666589 (2026-07-30)
const STBTC_START = 8666589

module.exports = {
  timetravel: true,
  stacks: { tvl },
}

async function tvl(api) {
  const block = api.block

  // STX backing: use stx-reserve-v2 after the PoX-5 cutover, reserve-v1 before
  const stxTarget = block >= STX_V2_CUTOVER
    ? `${D}.stx-reserve-v2`
    : `${D}.reserve-v1`
  const stxAbi = block >= STX_V2_CUTOVER ? 'get-total-stx' : 'get-total-stx'

  const stxReserve = await call({
    target: stxTarget,
    abi: stxAbi,
    block,
  })
  api.add('blockstack', stxReserve.value)

  // sBTC backing: stbtc-reserve deployed at block 8666589
  if (block >= STBTC_START) {
    const sbtcReserve = await call({
      target: `${D}.stbtc-reserve`,
      abi: 'get-total-sbtc',
      block,
    })
    api.add('sBTC', sbtcReserve.value)
  }
}
