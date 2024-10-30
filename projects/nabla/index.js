

const abis = {
  backstopPool: {
    token: "function token() external view returns (address)", 
    getPoolState: "function getPoolState(uint256[] calldata _allTokenPrices) external view returns (uint256 reserves_, int256 totalPoolWorth_, uint256 totalSupply_)",
    getBackedPoolCount: "function getBackedPoolCount() external view returns (uint256 count_)",
    getBackedPool: "function getBackedPool(uint256 index) external view returns (address pool_)",
  },
  swapPool: {
    token: "function token() external view returns (address)", 
    reserve: "function reserve() external view returns (uint256)",
  }
}

const ARB_PORTAL = "0xcB94Eee869a2041F3B44da423F78134aFb6b676B";
const 



async function tvl(api) {
  const routers = await api.call({
    abi: 'erc20:balanceOf',
    target: ARB_PORTAL,
  });

  api.add(pool.token.id, pool.reserves)
}

module.exports = {
    arbitrum: { tvl },
    base: { tvl },
}
