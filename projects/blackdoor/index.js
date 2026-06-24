// BlackDoor — geo-anchored prediction markets on Arbitrum One
// TVL = sum of USDC locked in all market liquidity pools (poolYes + poolNo)
// Factory: 0x4FaCa0EA8Dd4fE6E703f001435A99263336a498E
// Note: the factory deploys every contract — both binary markets and each
// individual outcome sub-contract of multi-outcome markets — so iterating
// factory.markets(i) captures the full TVL without extra recursion.

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

  const [poolsYes, poolsNo] = await Promise.all([
    api.multiCall({ abi: "uint256:poolYes", calls: validMarkets.map((m) => ({ target: m })), permitFailure: true }),
    api.multiCall({ abi: "uint256:poolNo",  calls: validMarkets.map((m) => ({ target: m })), permitFailure: true }),
  ]);

  poolsYes.forEach((v, i) => {
    if (v) api.add(USDC, v);
    if (poolsNo[i]) api.add(USDC, poolsNo[i]);
  });
}

module.exports = {
  arbitrum: { tvl },
  methodology:
    "Sum of USDC (poolYes + poolNo) across all contracts deployed through the " +
    "BlackDoor factory on Arbitrum One. The factory registers every deployed " +
    "contract — binary markets and individual outcome sub-contracts of " +
    "multi-outcome markets alike — so a single factory iteration captures the " +
    "full protocol TVL.",
};
