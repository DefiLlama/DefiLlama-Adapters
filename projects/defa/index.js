const { getActiveTvl } = require("./api");

async function tvl(api) {
  const activeTvl = await getActiveTvl();

  // USDC TVL
  api.addCGToken("usd-coin", activeTvl);

  return api.getBalances();
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts active invoice-backed liquidity via an on-chain Logger contract on Stellar Soroban. TVL is derived on-chain and exposed through a single read-only contract call. TVL is currently zero as pools are not yet deployed.",
  stellar: {
    tvl,
  },
};