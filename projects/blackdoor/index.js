// BlackDoor — geo-anchored prediction markets on Arbitrum One
// TVL = actual USDC locked in each market contract (usdc.balanceOf(market))
// Factory: 0x4FaCa0EA8Dd4fE6E703f001435A99263336a498E

const FACTORY = "0x4FaCa0EA8Dd4fE6E703f001435A99263336a498E";
const USDC    = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // Arbitrum One native USDC

async function tvl(api) {
  const total = Number(
    await api.call({ target: FACTORY, abi: "uint256:totalMarkets" })
  );
  if (total === 0) return;

  const indices = Array.from({ length: total }, (_, i) => i);

  const markets = await api.multiCall({
    abi: "function markets(uint256) view returns (address)",
    calls: indices.map((i) => ({ target: FACTORY, params: [i] })),
    permitFailure: true,
  });

  const validMarkets = markets.filter(Boolean);

  // Use actual USDC balance of each contract — not poolYes + poolNo which
  // double-counts: the FPMM seeds both pools equal to `net` from a single deposit,
  // so poolYes ≈ poolNo ≈ contract balance, making their sum ≈ 2× the real TVL.
  const balances = await api.multiCall({
    abi: "function balanceOf(address) view returns (uint256)",
    calls: validMarkets.map((m) => ({ target: USDC, params: [m] })),
    permitFailure: true,
  });

  balances.forEach((bal) => {
    if (bal) api.add(USDC, bal);
  });
}

module.exports = {
  arbitrum: { tvl },
  methodology:
    "Sum of USDC held in each BlackDoor PredictionMarket contract on Arbitrum One, " +
    "measured as the actual token balance rather than internal pool accounting variables.",
};
