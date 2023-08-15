const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { config } = require("./config");
const abi = require("./abi.json");

async function tvl(timestamp, ethBlock, _, { api }) {
  const chainConfig = config[api.chain];
  const crispSupplies = await api.multiCall({
    calls: chainConfig.pools.map(pool => pool.crispToken),
    abi: abi.totalSupply
  });

  const TVL = {};
  chainConfig.pools.forEach(({ crispToken }, i) => {
    sdk.util.sumSingleBalance(TVL, crispToken, crispSupplies[i], api.chain);
  });

  return TVL;
}

async function pool2(timestamp, ethBlock, _, { api }) {
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

  const TVL = {};
  poolStats.forEach((e) => {
    sdk.util.sumSingleBalance(TVL, e.token0, adjustAmount(e.totalAmount.total0, e.stakedAmount, e.totalSupply), api.chain);
    sdk.util.sumSingleBalance(TVL, e.token1, adjustAmount(e.totalAmount.total1, e.stakedAmount, e.totalSupply), api.chain);
  });

  return TVL;
}

function adjustAmount(amount, numerator, denominator) {
  return BigNumber(amount).times(numerator).div(denominator).toFixed(0);
}

module.exports = {
  start: 1684477800, // Fri May 19 2023 06:30:00 GMT+0000
  methodology: "TVL is a measure of the health of the Solid World ecosystem. It's the total amount of value that is locked up in our staking contract, and it's calculated by adding up the value of all the LP tokens that are staked. The LP tokens represent the amount of liquidity that has been provided to the Solid World platform.",
  polygon: {
    tvl,
    pool2
  }
};
