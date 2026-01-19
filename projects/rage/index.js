// pTokens are share tokens without independent pricing.
// We unwrap them into underlying assets for TVL.

const { sumTokens2 } = require("../helper/unwrapLPs");

const TREASURY = "0xff70Cd1E1931372F869c936582a7F42e49B6DA4c";

// Underlying tokens (priced by DefiLlama)
const HESTIA = "0xbc7755a153e852cf76cccddb4c2e7c368f6259d8";
const CIRCLE = "0x5babfc2f240bc5de90eb7e19d789412db1dec402";

// pTokens (shares) held by treasury (unpriced, so we unwrap them)
const PHESTIA = "0xF760fD8fEB1F5E3bf3651E2E4f227285a82470Ff";
const PCIRCLE = "0x55A81dA2a319dD60fB028c53Cb4419493B56f6c0";

// ERC4626-style unwrap (most common for share tokens)
const erc4626Abi = {
  balanceOf: "function balanceOf(address) view returns (uint256)",
  convertToAssets: "function convertToAssets(uint256 shares) view returns (uint256 assets)",
};

async function tvl(_, _b, _cb, { api }) {
  // 1) Count raw underlying tokens held by treasury
  await sumTokens2({
    api,
    owner: TREASURY,
    tokens: [HESTIA, CIRCLE],
  });

  // 2) Read pToken share balances
  const [pHestiaShares, pCircleShares] = await api.multiCall({
    abi: erc4626Abi.balanceOf,
    calls: [PHESTIA, PCIRCLE].map((target) => ({ target, params: [TREASURY] })),
  });

  // 3) Convert shares -> underlying asset amounts
  const [hestiaFromShares, circleFromShares] = await api.multiCall({
    abi: erc4626Abi.convertToAssets,
    calls: [
      { target: PHESTIA, params: [pHestiaShares] },
      { target: PCIRCLE, params: [pCircleShares] },
    ],
  });

  // 4) Add unwrapped underlying amounts to TVL
  api.add(HESTIA, hestiaFromShares);
  api.add(CIRCLE, circleFromShares);

  return api.getBalances();
}

module.exports = {
  base: { tvl },
};
