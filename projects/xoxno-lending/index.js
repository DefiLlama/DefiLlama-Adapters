const { get } = require('../helper/http')
const methodologies = require('../helper/methodologies')

const EXPORT_URL = 'https://api.xoxno.com/integrations/lending/stellar'

let marketsPromise

// One fetch shared by tvl and borrowed.
function getHubMarkets() {
  if (!marketsPromise) {
    marketsPromise = get(EXPORT_URL).then((data) =>
      Array.isArray(data.hubMarkets) ? data.hubMarkets : []
    )
  }
  return marketsPromise
}

// Markets are keyed by (hubId, token) and the same token is listed on several
// hubs, so balances accumulate per token. Raw base units are added and priced
// by DefiLlama; the export's own USD figures are deliberately not used.
async function addRaw(api, field) {
  for (const market of await getHubMarkets()) {
    if (market.token && market[field] != null)
      api.add(market.token, market[field].toString())
  }
}

// tvlCashRaw is pool cash, i.e. supplied minus borrowed. Borrowed is reported
// on its own key rather than added here, which would double-count it.
const tvl = async (api) => addRaw(api, 'tvlCashRaw')
const borrowed = async (api) => addRaw(api, 'borrowedRaw')

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket}. TVL is pool cash and borrowed is outstanding debt, both per hub in raw base units so DefiLlama prices them. Balances come from the protocol's event-sourced integration API: the pool's reserve views take a HubAssetKey struct that callSoroban cannot encode, and sumTokens resolves classic G-accounts while the pool is a C-contract.`,
  stellar: { tvl, borrowed },
}
