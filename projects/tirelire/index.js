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
}

module.exports = {
  methodology:
    "TVL is the value of both tokens held by each Tirelire Hypervisor across its " +
    "active Uniswap V3 positions, idle balances, and uncollected fees, read " +
    "on-chain via getTotalAmounts(). Tirelire deploys the audited Gamma Hypervisor " +
    "verbatim; there is no custom accounting.",
  doublecounted: true,
  robinhood: { tvl },
};
