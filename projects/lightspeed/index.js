const { get } = require('../helper/http')

const FEATURED_APP_LOCKING_URL = 'https://lighthouse.cantonloop.com/api/featured-app-locking'
const TEMPLE_APP_NAMES = new Set(['Temple Trading', 'Temple Trading Expansion'])

async function tvl(api) {
  const { apps } = await get(FEATURED_APP_LOCKING_URL)
  const templeApps = apps.filter(({ app_name, institution }) =>
    institution === 'Temple' && TEMPLE_APP_NAMES.has(app_name)
  )

  if (!templeApps.length) throw new Error('No Temple featured-app locking rows found')

  const balancesByWallet = {}
  for (const app of templeApps) {
    for (const wallet of app.locking_wallets || []) {
      if (!wallet.indexed) continue
      balancesByWallet[wallet.address] = wallet.total_balance
    }
  }

  const balances = Object.values(balancesByWallet)
  if (!balances.length) throw new Error('No indexed Temple locking wallets found')

  for (const balance of balances) {
    api.addGasToken(Number(balance) * 1e18)
  }
}

module.exports = {
  timetravel: false,
  canton: { tvl },
  methodology:
    "TVL is the deduplicated CC balance in Temple's indexed CIP-0116 featured-app locking wallet for Temple Trading/Lightspeed, sourced from Lighthouse's public Canton explorer API.",
}
