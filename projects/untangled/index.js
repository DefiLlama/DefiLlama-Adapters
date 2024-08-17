const Contracts = {
  SecuritizationManager: "0x4DCC7a839CE7e952Cd90d03d65C70B9CCD6BA4C2",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
  SecuritizationPoolValueService: "0x8dA445046281e6FBf2aBAd56952331B9D5Ea8d45"
};

async function tvl(api) {
  const pools = await api.fetchList({  lengthAbi: 'getPoolsLength', itemAbi: 'pools', target: Contracts.SecuritizationManager})
  const reserves = await api.multiCall({  abi: 'function getReserves() external view returns (uint256, uint256)', calls: pools })
  api.add(Contracts.USDC, reserves.map(i => i[1]))
}

async function borrowed(api) {
  const pools = await api.fetchList({  lengthAbi: 'getPoolsLength', itemAbi: 'pools', target: Contracts.SecuritizationManager})
  const poolDebt = await api.multiCall({target: Contracts.SecuritizationPoolValueService, abi: "function getExpectedAssetsValue(address poolAddress) external view returns (uint256)", calls:pools})
  api.add(Contracts.USDC, poolDebt)
}

module.exports = {
  celo: {
    tvl, borrowed,
  },
};
