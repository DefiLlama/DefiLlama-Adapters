const POOLINFO = '0xCD3Db0110d3955072134bd16d497a4D3C341F0E6';

async function tvl(api) {
  const res = await api.call({ target: POOLINFO, abi:  "function getTotalValueLockedList() view returns ((address token, uint8 decimals, uint256 amount)[])"})
  res.forEach(i => api.add(i.token, i.amount))
}

module.exports = {
  deadFrom: '2025-09-26',
  hallmarks: [[1758844800, "Rug pull"]],
  hyperliquid: { tvl: () => ({  }) },
}
