/*
Barker is a non-custodial stablecoin yield distribution layer — it runs boost
campaigns on top of third-party vaults. User principal is deposited directly
into the underlying protocol's own vault (Barker contracts never hold user
funds), and Barker distributes boosted rewards on top. Hence Barker itself
has no TVL. This adapter was made to integrate Barker in the Yields dashboard.
For more information on Barker, see https://barker.money
*/

async function tvl() {
  return {};
}

module.exports = {
  methodology:
    "Barker is a non-custodial boost/campaign layer on top of third-party vaults: user funds sit in the underlying protocols' own vaults, so Barker has no TVL of its own. See the yield dashboard for a list of Barker-boosted pools.",
  ethereum: {
    tvl,
  },
  hyperliquid: {
    tvl,
  },
};
