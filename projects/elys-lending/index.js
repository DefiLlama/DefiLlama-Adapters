const { get } = require('../helper/http')

async function tvl(api) {
  const { net_stakings } = await get('https://api.elys.network/elys-network/elys/masterchef/chain_tvl')
  net_stakings.filter(i => i.denom === 'USDC').map(i => api.addCGToken('usd-coin', i.amount))
}


async function borrowed(api) {
  const { usdc_staking, net_stakings } = await get('https://api.elys.network/elys-network/elys/masterchef/chain_tvl')
  api.addCGToken('usd-coin', usdc_staking)
  net_stakings.filter(i => i.denom === 'USDC').map(i => api.addCGToken('usd-coin', i.amount * -1))
}


module.exports = {
  timetravel: false,
  elys: { tvl, borrowed, }
}