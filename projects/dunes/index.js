const DETH_DEPOSIT_POOL = "0x8a1229eDB53f55Bb09D472aFc95D12154590108E";
const DUSD_DEPOSIT_POOL = "0x634598473B91a6870c1DB151142db0b61C5de8CC";

async function tvl(api) {
  const res = await api.multiCall({ abi: 'function getTotalDeposits() external view returns (address[], uint256[])', calls: [DETH_DEPOSIT_POOL, DUSD_DEPOSIT_POOL] })
  res.forEach(i => api.add(...i))
}

module.exports = {
  doublecounted: true,
  methodology:
    "Deposited assets (LSTs, LRTs, stables, Pendle tokens, Karak tokens, etc.) in deposit pools",
  ethereum: {
    tvl,
  },
};