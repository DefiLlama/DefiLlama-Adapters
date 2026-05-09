const { get } = require('../helper/http')

const BASE_URL = 'https://lighthouse.cantonloop.com/api/parties/'

// Per-pool operator parties that custody pool reserves. Only CC-containing
// pools are listed; the USDCx/CUSD pool has no CC side and the Lighthouse API
// does not expose non-CC balances per party.
const parties = [
  'mainnet-pool-party-amulet-cusd-operator::1220724bbd5179d9f5d19de90f31cfa0e99e4bf9cf815e3e5e669a40524725d9e98b',
  'mainnet-pool-party-amulet-usdcx-operator::1220647009424eff86ef09493a366aa314e8533c0cd8070aa82a9b014e42daad03c3',
]

async function tvl(api) {
  for (const party of parties) {
    const { balance } = await get(BASE_URL + party + '/balance')
    api.addGasToken(Number(balance.total_coin_holdings) * 1e18)
  }
}

module.exports = {
  timetravel: false,
  canton: { tvl },
  methodology:
    "Sum of Canton Coin (CC) reserves held by Pool Party's CC/CUSD and " +
    "CC/USDCx pool operator parties, via the Lighthouse API. Stablecoin " +
    "sides (CUSD, USDCx) and the USDCx/CUSD pool are not included since " +
    "non-CC balances are not currently queryable through public Canton APIs.",
}
