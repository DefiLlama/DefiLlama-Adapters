/*
 * Pool Party — Canton Network AMM
 *
 * Pool Party is the first AMM on Canton Network, built by Send Foundation.
 * Pairs at launch: CC/CUSD, CC/USDCx, USDCx/CUSD.
 *
 * TVL methodology:
 *   This adapter mirrors the existing `wcc` adapter
 *   (projects/wcc/index.js) — the only currently supported Canton TVL pattern.
 *   It queries the public Canton Lighthouse API for the CC balance held by
 *   Pool Party's Canton party and reports it as gas-token (CC) TVL.
 *
 *   The Lighthouse API exposes Canton Coin balances per party only; CUSD and
 *   USDCx (the stablecoin sides of Pool Party's pools) are not currently
 *   queryable through public Canton APIs. As a result this adapter
 *   underreports the full pool TVL by roughly the value of the stablecoin
 *   sides. Adding the stablecoin sides is tracked as Phase 2.
 *
 * Docs: https://info.send.it/docs/pool-party/overview
 * App:  https://cantonwallet.com/pools/
 */

const { get } = require('../helper/http')

const BASE_URL = 'https://lighthouse.cantonloop.com/api/parties/'

// Pool Party's Canton party ID. Source:
// https://info.send.it/docs/miscellaneous/send-contract-addresses
const parties = [
  'poolparty::1220f1b0d7a83c7eaaf6d712d95d5952ea2c801238af9c342e8d83c87dfc45c999dc',
]

async function tvl(api) {
  for (const party of parties) {
    const { balance } = await get(BASE_URL + party + '/balance')
    // total_coin_holdings is a decimal-string CC balance.
    // Convert to atomic units (CC has 18 decimals, matching the wcc adapter's
    // 1e18 multiplier).
    api.addGasToken(Number(balance.total_coin_holdings) * 1e18)
  }
}

module.exports = {
  timetravel: false,
  canton: { tvl },
  methodology:
    "TVL is the total Canton Coin (CC) balance held by Pool Party's Canton " +
    "party, fetched from the public Lighthouse API. Stablecoin sides of pools " +
    "(CUSD, USDCx) are not yet queryable through public Canton APIs and are " +
    "not included; this matches the methodology used by the existing wcc " +
    "adapter and is expected to be expanded once Canton APIs surface " +
    "non-CC token balances per party.",
}
