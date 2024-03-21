const { config } = require("./config");
const abi = require("./abi.json");
const { fetchForwardContractBatchSupplies } = require("./forward-contract-batch-supply");
const { fetchCategoriesAndBatches } = require("./categories-and-batches");
const { valuateBatches } = require("./batch-valuation");

// the value of the current on-chain forward credits, based on their exchange rate to CRISP tokens
async function tvl(api) {
  const batchSupplies = await fetchForwardContractBatchSupplies(api);
  const [categories, batches] = await fetchCategoriesAndBatches(api, Object.keys(batchSupplies));
  const batchesValuation = await valuateBatches(batches, categories, batchSupplies);

  batchesValuation.forEach(({ crispToken, amount }) => {
    api.add(crispToken, amount)
  });
}

async function pool2(api) {
  const chainConfig = config[api.chain];
  const [token0s, token1s, totalAmounts, totalSupplies, stakedAmounts] = await Promise.all([
    api.multiCall({ calls: chainConfig.pools.map(pool => pool.hypervisor), abi: abi.token0 }),
    api.multiCall({ calls: chainConfig.pools.map(pool => pool.hypervisor), abi: abi.token1 }),
    api.multiCall({ calls: chainConfig.pools.map(pool => pool.hypervisor), abi: abi.getTotalAmounts }),
    api.multiCall({ calls: chainConfig.pools.map(pool => pool.hypervisor), abi: abi.totalSupply }),
    api.multiCall({
      calls: chainConfig.pools.map(pool => ({
        target: pool.hypervisor,
        params: [pool.stakingContract]
      })), abi: abi.balanceOf
    })
  ]);

  // zip the results
  const poolStats = chainConfig.pools.map((_, i) => ({
    token0: token0s[i],
    token1: token1s[i],
    totalAmount: totalAmounts[i],
    totalSupply: totalSupplies[i],
    stakedAmount: stakedAmounts[i]
  }));

  poolStats.forEach((e) => {
    const ratio = e.stakedAmount /e.totalSupply
    api.add(e.token0, e.totalAmount.total0 *ratio)
    api.add(e.token1, e.totalAmount.total1 *ratio)
  });
}

module.exports = {
  start: 1684477800, // Fri May 19 2023 06:30:00 GMT+0000
  methodology: `TVL is a measure of the health of the Solid World ecosystem. The TVL can be looked at from 2 perspectives. The 1st perspective, "RWA" valuation, represents the total value of the tokenized forward carbon credits, and is computed as the present value of the on-chain forward credits (ERC1155), based on their exchange rate to CRISP tokens (ERC20) and subsequent USDC value, summed-up.The 2nd perspective, "pool2", represents the total value locked up in our staking contract, and it's calculated by adding up the value of all the LP tokens that are staked. The LP tokens represent the amount of liquidity that has been provided to the Solid World platform.`,
  polygon: {
    tvl,
    pool2
  }
};
