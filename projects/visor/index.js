const { getLogs } = require('../helper/cache/getLogs')
const hypervisorAbi = require("./abis/hypervisor.json");
const { staking } = require("../helper/staking");
const getTotalAmounts =
  "function getTotalAmounts() view returns (uint256 total0, uint256 total1)";
const { getUniqueAddresses } = require("../helper/utils");
const config = require("./config");

module.exports = {
  doublecounted: true,
  start: 1616679762, // (Mar-25-2021 01:42:42 PM +UTC)
};

Object.keys(config).forEach(chain => {
  let { blacklistedHypes = [], registries, LIQUIDITY_MINING_POOLS } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {

      if (LIQUIDITY_MINING_POOLS) {
        const bals = await api.multiCall({ abi: hypervisorAbi.getHyperVisorData, calls: LIQUIDITY_MINING_POOLS, });
        bals.forEach(({ stakingToken, totalStake }) => api.add(stakingToken, totalStake));
      }

      let hypervisors = []
      for (const { factory, fromBlock } of registries) {
        const logs = await getLogs({
          api,
          target: factory,
          eventAbi: 'event HypeAdded(address hype, uint256 index)',
          onlyArgs: true,
          fromBlock,
        })
        hypervisors.push(...logs.map(i => i.hype))
      }
      hypervisors = getUniqueAddresses(hypervisors);
      if (blacklistedHypes.length) {
        const blacklistSet = new Set(blacklistedHypes.map((i) => i.toLowerCase()));
        hypervisors = hypervisors.filter((i) => !blacklistSet.has(i.toLowerCase()));
      }
      const supplies = await api.multiCall({
        abi: "erc20:totalSupply",
        calls: hypervisors,
        permitFailure: true,
      });
      hypervisors = hypervisors.filter((_, i) => +supplies[i] > 0);

      const [token0s, token1s, bals] = await Promise.all([
        api.multiCall({ calls: hypervisors, abi: "address:token0" }),
        api.multiCall({ calls: hypervisors, abi: "address:token1" }),
        api.multiCall({ calls: hypervisors, abi: getTotalAmounts }),
      ]);
      bals.forEach(({ total0, total1 }, i) => {
        api.add(token0s[i], total0);
        api.add(token1s[i], total1);
      });
      return api.getBalances()
    }
  }
})

module.exports.ethereum.staking = staking("0x26805021988f1a45dc708b5fb75fc75f21747d8c", "0x6bea7cfef803d1e3d5f7c0103f7ded065644e197",)
