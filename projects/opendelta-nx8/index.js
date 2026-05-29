const { get } = require('../helper/http')

const RESERVES_FEED = 'https://accountable.prod.opendelta.com:8443/dashboard'

async function tvl(api) {
  const { res, data } = await get(RESERVES_FEED)
  const totalReserves = data?.reserves?.total_reserves?.value
  if (res !== 'ok' || !totalReserves || totalReserves <= 0)
    throw new Error('OpenDelta reserves feed returned no total_reserves value')
  api.addUSDValue(totalReserves)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL is the total custodied reserves (USD) backing OpenDelta's NX8 tokenized L1 index token, sourced from Accountable's proof-of-reserves feed.",
  solana: {
    tvl,
  },
}
