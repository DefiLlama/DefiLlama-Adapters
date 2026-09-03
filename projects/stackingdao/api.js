const { call } = require('../helper/chain/stacks-api')

const D = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG'

module.exports = {
  timetravel: false,
  stacks: { tvl },
}

async function tvl(api) {
  // stSTX backing: total STX in stx-reserve-v2 (liquid balance + staked in PoX-5)
  const stxReserve = await call({
    target: `${D}.stx-reserve-v2`,
    abi: 'get-total-stx',
  })
  api.add('blockstack', stxReserve.value)

  // stBTC backing: total sBTC in stbtc-reserve (liquid balance + bonded)
  const sbtcReserve = await call({
    target: `${D}.stbtc-reserve`,
    abi: 'get-total-sbtc',
  })
  api.add('sBTC', sbtcReserve.value)
}
