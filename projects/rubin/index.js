const { get } = require("../helper/http");

// Rubin — self-custody decentralized perpetual & spot exchange.
// TVL = USDC collateral deposited on the Rubin chain, measured as the on-chain
// total supply of the USDC collateral denom (uusdc, 6 decimals), via the
// Cosmos bank REST. Mirrors the dydx-v4 adapter approach.
async function tvl() {
  const data = await get(
    "https://rest.mainnet.rubin.trade/cosmos/bank/v1beta1/supply/by_denom?denom=uusdc"
  );
  return { "usd-coin": Number(data.amount.amount) / 1e6 };
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts USDC collateral deposited on Rubin, measured as the total supply of the chain's USDC (uusdc) collateral denomination.",
  rubin: {
    tvl,
  },
};
