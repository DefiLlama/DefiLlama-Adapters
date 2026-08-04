const axios = require("axios");
const ADDRESSES = require("../helper/coreAssets.json");
const BigNumber = require("bignumber.js");

// IOTrader is an Orderly Network builder (broker_id: iotrader).
// User collateral is deposited into Orderly vault contracts shared across chains:
// https://orderly.network/docs/build-on-omnichain/addresses
// Per-builder TVL cannot be split on-chain from the shared vault, so it is
// attributed via Orderly's public balance stats API (same pattern as projects/clob).
const BROKER_ID = "iotrader";

async function tvl(api) {
  const { data } = await axios.get(
    `https://api.orderly.org/v1/public/balance/stats?broker_id=${BROKER_ID}`
  );
  // Orderly reports holdings in USD/USDC units; convert to USDC base units (6 decimals)
  const amount = new BigNumber(data.data.total_holding).times(1e6).toFixed(0);
  api.add(ADDRESSES.arbitrum.USDC_CIRCLE, amount);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  doublecounted: true,
  methodology:
    "TVL is IOTrader user holdings deposited into Orderly Network vault contracts across all supported chains, attributed via Orderly broker_id=iotrader (GET /v1/public/balance/stats). Marked doublecounted because the same vault balances are already tracked by the orderly-network adapter.",
  arbitrum: { tvl },
};
