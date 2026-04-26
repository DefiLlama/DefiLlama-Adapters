const { get } = require('../helper/http')

const ENDPOINT = 'https://vara-staking-tvl.vercel.app/api/tvl'

async function tvl() {
  const data = await get(ENDPOINT)
  return {
    'vara-network': data.stakedVara
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Fetches total VARA staked from a dedicated endpoint that queries the Vara Network Substrate staking pallet',
  vara: { tvl },
}
