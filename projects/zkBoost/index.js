const abi = {
    getTotalLockCount: "uint256:getTotalLockCount",
    getLock: "function getLock(uint256 index) view returns (tuple(uint256 id, address token, address owner, uint256 amount, uint256 lockDate, uint256 unlockDate))",
    getLockAt: "function getLockAt(uint256 index) view returns (tuple(uint256 id, address token, address owner, uint256 amount, uint256 lockDate, uint256 tgeDate, uint256 tgeBps, uint256 cycle, uint256 cycleBps, uint256 unlockedAmount, string description))",
}
const config = {
    era: {
        vaults: [
            '0x4d2528305C135A056D7e2A0e8BD1946273Fb89D7'
        ]
    }
}
const { sumTokens2 } = require("../helper/unwrapLPs")

module.exports = {}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const {chain} = api
      const { vaults, } = config[chain]
      for (const vault of vaults) {
        const data = await api.fetchList({  lengthAbi: abi.getTotalLockCount, itemAbi: abi.getLockAt, target: vault })
        await sumTokens2({ api, owner: vault, tokens: data.map(i => i.token), resolveLP: true, })
      }
      return api.getBalances()
    }
  }
})