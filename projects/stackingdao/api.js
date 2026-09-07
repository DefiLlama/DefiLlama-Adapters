const { call, getBlockAtTimestamp } = require('../helper/chain/stacks-api')
const { nullAddress } = require('../helper/tokenMapping')

const D = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG'
const SBTC = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token'

const STX_V2_CUTOVER = 8712010
const STBTC_START = 8666589

module.exports = {
  timetravel: true,
  stacks: { tvl },
}

function toAmount(v) {
  return String(typeof v === 'object' && v !== null ? v.value : v)
}

async function tvl(api) {
  const block = api.block ?? (api.timestamp ? await getBlockAtTimestamp(api.timestamp) : undefined)
  const isLatest = block === undefined

  const reserveV1 = await call({ target: `${D}.reserve-v1`, abi: 'get-total-stx', block })
  api.add(nullAddress, toAmount(reserveV1))

  if (isLatest || block >= STX_V2_CUTOVER) {
    const reserveV2 = await call({ target: `${D}.stx-reserve-v2`, abi: 'get-total-stx', block })
    api.add(nullAddress, toAmount(reserveV2))
  }

  if (isLatest || block >= STBTC_START) {
    const sbtcReserve = await call({ target: `${D}.stbtc-reserve`, abi: 'get-total-sbtc', block })
    api.add(SBTC, toAmount(sbtcReserve))
  }

  return api.getBalances()
}
