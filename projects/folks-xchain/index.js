const sdk = require('@defillama/sdk')
const { HubPools, HubPoolAbi, } = require("./constants");

async function tvl(api) {
  const tokensAndOwners = HubPools[api.chain].map(pool => [pool.tokenAddress, pool.chainPoolAddress ?? pool.poolAddress])
  return api.sumTokens({ tokensAndOwners })
}

async function borrowed(api) {
  const HubPoolsChain = HubPools[api.chain]
  let chainApi = api
  if (api.chain !== 'avax') {
    chainApi = new sdk.ChainApi({ chain: 'avax', timestamp: api.timestamp })
    await chainApi.getBlock()
  }
  const targets = HubPoolsChain.map(pool => pool.poolAddress)

  const [varBorrowsData, stableBorrowsData] = await Promise.all([
    await chainApi.multiCall({ calls: targets, abi: HubPoolAbi.getVariableBorrowData, }),
    await chainApi.multiCall({ calls: targets, abi: HubPoolAbi.getStableBorrowData, })
  ]);

  HubPoolsChain.forEach((pool, idx) => {
    api.add(pool.tokenAddress, Number(varBorrowsData[idx][3]) + Number(stableBorrowsData[idx][8]))
  })
  return api.getBalances()
}

module.exports = {
  methodology: "The Folks Finance xChain states are saved in the Hub chain contracts i.e. Avalanche; TVL counts deposited total amount values for each pool, borrowed counts variable and stable borrowed total amount values for each pool",
}

Object.keys(HubPools).forEach(chain => {
  module.exports[chain] = { tvl, borrowed, }
})