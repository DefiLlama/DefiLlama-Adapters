const sdk = require('@defillama/sdk')
const { HubPools, HubPoolAbi, } = require("./constants");

async function tvl(api) {
  const tokensAndOwners = []
  const HubPoolsChain = HubPools[api.chain] ?? []
  HubPoolsChain.forEach(pool => {
    if (pool.chainPoolAddress) tokensAndOwners.push([pool.tokenAddress, pool.chainPoolAddress])
    if (pool.poolAddress) tokensAndOwners.push([pool.tokenAddress, pool.poolAddress])
  })

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
  methodology: "In Folks Finance's xChain lending native assets remain on their native chains while crosschain assets like USDC are pooled together, which can be accessed equally from all connected networks. TVL counts for each pool: deposited, borrowed variable and borrowed stable total amounts.",
}

Object.keys(HubPools).forEach(chain => {
  module.exports[chain] = { tvl, borrowed, }
})