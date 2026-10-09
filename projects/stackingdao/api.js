const { call, getBlockAtTimestamp } = require('../helper/chain/stacks-api')
const { nullAddress } = require('../helper/tokenMapping')

const D = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG'
const SBTC = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token'

module.exports = {
  timetravel: true,
  stacks: { tvl },
}

function toAmount(v) {
  return String(typeof v === 'object' && v !== null ? v.value : v)
}

const RESERVES = [
  { target: `${D}.reserve-v1`, abi: 'get-total-stx', token: nullAddress },
  { target: `${D}.stx-reserve-v2`, abi: 'get-total-stx', token: nullAddress },
  { target: `${D}.stbtc-reserve`, abi: 'get-total-sbtc', token: SBTC },
]

async function tvl(api) {
  const block = api.block ?? (api.timestamp ? await getBlockAtTimestamp(api.timestamp) : undefined)

  for (const { target, abi, token } of RESERVES) {
    const value = await call({ target, abi, block, allowMissing: true })
    if (value !== undefined) api.add(token, toAmount(value))
  }

  return api.getBalances()
}
