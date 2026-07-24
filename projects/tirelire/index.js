// Tirelire — TVL adapter for DefiLlama-Adapters.
//
// TARGET PATH IN THE PR: projects/tirelire/index.js
// Repo: https://github.com/DefiLlama/DefiLlama-Adapters  (CommonJS)
//
// What Tirelire is: an automated Uniswap V3 concentrated-liquidity manager (ALM)
// on Robinhood Chain (Arbitrum Orbit L2, chainId 4663, DeFiLlama slug "robinhood").
// It deploys the audited Gamma Hypervisor VERBATIM (config-only, no custom
// Solidity) and manages USDG/WETH and USDG/NVDA Uniswap V3 positions.
//
// TVL model: each Hypervisor holds both tokens across its active Uniswap V3
// positions (base + limit) plus idle balances plus uncollected fees. The
// contract exposes this as getTotalAmounts() -> (total0, total1). A plain
// balanceOf() would MISS the in-range position liquidity, so we must use
// getTotalAmounts(). This is the same method the canonical Gamma adapter uses.

const HYPERVISORS = [
  "0xb9F974d19425d93B3a9dC80c8f0d3aE428Cbb2B2", // Tirelire USDG-WETH (0.05%)
  "0xcFefe9Ee6B45587939debB869394190432e72258", // Tirelire USDG-NVDA (0.05%)
];

async function tvl(api) {
  const token0s = await api.multiCall({ abi: "address:token0", calls: HYPERVISORS });
  const token1s = await api.multiCall({ abi: "address:token1", calls: HYPERVISORS });
  const totals = await api.multiCall({
    abi: "function getTotalAmounts() view returns (uint256 total0, uint256 total1)",
    calls: HYPERVISORS,
  });
  totals.forEach((t, i) => {
    const total0 = t.total0 !== undefined ? t.total0 : t[0];
    const total1 = t.total1 !== undefined ? t.total1 : t[1];
    api.add(token0s[i], total0);
    api.add(token1s[i], total1);
  });
  return api.getBalances();
}

module.exports = {
  // Tokens live in the Hypervisor's Uniswap V3 positions, valued at spot from
  // the underlying tokens — no external oracle, no double counting.
  methodology:
    "TVL is the value of both tokens held by each Tirelire Hypervisor across its " +
    "active Uniswap V3 positions, idle balances, and uncollected fees, read " +
    "on-chain via getTotalAmounts(). Tirelire deploys the audited Gamma Hypervisor " +
    "verbatim; there is no custom accounting.",
  robinhood: { tvl },
};
