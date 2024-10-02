const { multiCall } = require("@defillama/sdk/build/abi/abi2");
const { HubPools, HubPoolAbi, HubChainId } = require("./constants");

async function tvl(api) {
  const HubPoolsChain = HubPools[api.chain]

  const depositsData = await multiCall({
    calls: HubPoolsChain.map(pool => ({
      target: pool.poolAddress,
    })),
    abi: HubPoolAbi.getDepositData,
    chain: HubChainId
  });

  HubPoolsChain.forEach((pool, idx) => {
    api.add(pool.tokenAddress, Number(depositsData[idx][1]))
  })
}

async function borrowed(api) {
  const HubPoolsChain = HubPools[api.chain]
  const targets = HubPoolsChain.map(pool => ({ target: pool.poolAddress }))

  const [varBorrowsData, stableBorrowsData] = await Promise.all([
    await multiCall({
      calls: targets,
      abi: HubPoolAbi.getVariableBorrowData,
      chain: HubChainId
    }),
    await multiCall({
      calls: targets,
      abi: HubPoolAbi.getStableBorrowData,
      chain: HubChainId
    })
  ]);

  HubPoolsChain.forEach((pool, idx) => {
    api.add(pool.tokenAddress, Number(varBorrowsData[idx][3]) + Number(stableBorrowsData[idx][8]))
  })
}

module.exports = {
  methodology: "The Folks Finance xChain states are saved in the Hub chain contracts i.e. Avalanche; TVL counts deposited total amount values for each pool, borrowed counts variable and stable borrowed total amount values for each pool",
  avax: { tvl, borrowed },
  ethereum: { tvl, borrowed },
  base: { tvl, borrowed },
};
