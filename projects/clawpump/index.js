const { fetchURL } = require('../helper/utils')
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const { data } = await fetchURL('https://agents.clawpump.tech/api/platform-stats')
  api.add(ADDRESSES.solana.SOL, data.agenticFundingSol * 1e9)
}

module.exports = {
  methodology: 'TVL is the SOL deposited by users into ClawPump to fund AI agent compute and trading, as reported by the platform stats API.',
  timetravel: false,
  solana: { tvl },
}
