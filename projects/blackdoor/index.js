// BlackDoor — geo-anchored prediction markets on Arbitrum One
// TVL = sum of USDC locked in all market liquidity pools (poolYes + poolNo)
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
  });

  const [poolsYes, poolsNo] = await Promise.all([
    api.multiCall({ abi: "uint256:poolYes", calls: markets.map((m) => ({ target: m })) }),
    api.multiCall({ abi: "uint256:poolNo",  calls: markets.map((m) => ({ target: m })) }),
  ]);

  poolsYes.forEach((v, i) => {
    api.add(USDC, v);
    api.add(USDC, poolsNo[i]);
  });
}

module.exports = {
  arbitrum: { tvl },
  methodology:
    "Sum of USDC locked in all BlackDoor prediction market liquidity pools (poolYes + poolNo) " +
    "deployed through the factory contract on Arbitrum One. Includes all binary markets and " +
    "individual outcome sub-contracts for multi-outcome markets.",
};
