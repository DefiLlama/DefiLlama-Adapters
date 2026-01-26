const { getActiveTvl } = require("./api");

async function tvl(api) {
  let activeTvl = await getActiveTvl();

  // Soroban returns BigInt → convert safely
  if (typeof activeTvl === "bigint") {
    activeTvl = Number(activeTvl);
  }

  // USDC has 6 decimals
  api.addCGToken("usd-coin", activeTvl / 1e6);

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
