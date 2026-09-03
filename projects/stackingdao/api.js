const { call } = require('../helper/chain/stacks-api')

const D = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG'

module.exports = {
  timetravel: true,
  stacks: { tvl },
}

async function tvl(api) {
  const block = api.block

  // stSTX backing: total STX in stx-reserve-v2 (liquid balance + staked in PoX-5)
  try {
    const stxReserve = await call({
      target: `${D}.stx-reserve-v2`,
      abi: 'get-total-stx',
      block,
    })
    api.add('blockstack', stxReserve.value)
  } catch (e) {
    console.error('stackingdao: stx-reserve-v2.get-total-stx failed:', e.message)
  }

  // stBTC backing: total sBTC in stbtc-reserve (liquid balance + bonded)
  try {
    const sbtcReserve = await call({
      target: `${D}.stbtc-reserve`,
      abi: 'get-total-sbtc',
      block,
    })
    api.add('sBTC', sbtcReserve.value)
  } catch (e) {
    console.error('stackingdao: stbtc-reserve.get-total-sbtc failed:', e.message)
  }
}
