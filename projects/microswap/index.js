const { yieldHelper } = require("../helper/yieldHelper");

const abis = {
  name: "string:name",
  wantLockedTotal: "uint256:wantLockedTotal",
  poolInfo: "function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardTime, address strategy, uint256 earlyWithdrawFee, uint256 earlyWithdrawTime)",
}

async function getTokenBalances ({ api, poolInfos, }) {
  const strategies = poolInfos.map(i => i.strategy)
  return api.multiCall({ abi: abis.wantLockedTotal, calls: strategies })
}

module.exports = yieldHelper({
  project: 'microswap',
  chain: 'cronos_zkevm',
  masterchef: '0x19A497E9c034c0D66952366F46f0e4e8b27465a8',
  nativeToken: '',
  abis,
  getTokens: ({ poolInfos, }) => poolInfos.map(i => i.want),
  getTokenBalances,
})
