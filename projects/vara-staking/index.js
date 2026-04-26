const { get } = require('../helper/http')

async function tvl() {
  const { data } = await get('https://api.gear.foundation/total-era-stake')
  // data is sorted chronologically, last entry = latest era
  // total field is already in VARA units (not raw with 12 decimals)
  const latest = data[data.length - 1]
  return {
    'vara-network': Number(latest.total)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Counts total VARA staked across all validators via the Gear Foundation era-stake API',
  vara: { tvl },
}
