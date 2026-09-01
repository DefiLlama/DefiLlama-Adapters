const { yieldHelper } = require('../helper/yieldHelper')
const abi = {
    "poolLength": "uint256:poolLength",
    "poolInfo": "function poolInfo(uint256) view returns (address want, address strat)",
    "wantLockedTotal": "uint256:wantLockedTotal",
    "token0": "address:token0",
    "token1": "address:token1"
  };
const vaultchef = "0xBdA1f897E851c7EF22CD490D2Cf2DAce4645A904";
const fish = "0x3a3df212b7aa91aa0402b9035b098891d276572b";

module.exports = yieldHelper({
  project: 'polycat',
  chain: 'polygon',
  masterchef: vaultchef,
  nativeToken: fish,
  blacklistedTokens: ['0xd76D74DE1EF47E6A390FA53b3b11ef095d0c738c'],
  getTokenBalances: async ({ api, poolIds, }) => {
    const lockedTotals = await api.multiCall({ abi: 'uint256:wantLockedTotal', calls: poolIds, permitFailure: true })
    return lockedTotals.map(i => i ?? 0)
  },
  abis: {
    poolInfo: abi.poolInfo
  }
})
