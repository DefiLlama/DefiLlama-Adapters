const abi = require("./abi.json");
const mux3CoreAbi = require("./mux3CoreAbi.json");
const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs')

const readerContract = {
  arbitrum: '0x437CEa956B415e97517020490205c07f4a845168',
  bsc: '0x2981Bb8F9c7f7C5b9d8CA5e41C0D9cBbd89C7489',
  avax: '0xB33e3dDcE77b7679fA92AF77863Ae439C44c8519',
  fantom: '0xfb0DCDC30BF892Ec981255e7133AEcb8ea642b76',
  optimism: '0x572E9467b2585c3Ab6D9CbEEED9619Fd168254D5',
}

const mux3CoreAddress = '0x85c8F4a67F4f9AD7b38e875c8FeDE7F4c878bFAc'

async function getMux3Tvl(chain, block) {
  // get all mux3 collateral pools
  const { output: pools } = await sdk.api.abi.call({
    target: mux3CoreAddress,
    abi: mux3CoreAbi.listCollateralPool,
    chain, block,
  })

  // get all supported collateral tokens
  const { output: collateralTokens } = await sdk.api.abi.call({
    target: mux3CoreAddress,
    abi: mux3CoreAbi.listCollateralTokens,
    chain, block,
  })

  // get balances of all collateral tokens in all collateral pools
  return await sumTokens2({ chain, block, tokens: collateralTokens, owners: pools, })
}

async function tvl(chain, block) {
  const { output: storage } = await sdk.api.abi.call({
    target: readerContract[chain],
    abi: abi.getChainStorage,
    chain, block,
  })
  const { output: pool } = await sdk.api.abi.call({
    target: readerContract[chain],
    abi: abi.pool,
    chain, block,
  })
  
  const assets = storage[1]
  const dexs = storage[2]
  const balances = await sumTokens2({ chain, block, tokens: assets.map(i => i.tokenAddress), owner: pool, })
  

  dexs.forEach(dex => {
    dex.liquidityBalance.forEach((balance, index) => {
      const assetId = dex.assetIds[index]
      const token = assets.find(t => assetId === t.id)
      sdk.util.sumSingleBalance(balances,chain+':'+token.tokenAddress,balance.toString())
    })
  })

  // get mux3 tvl, only for arbitrum
  if (chain === 'arbitrum') {
    sdk.util.mergeBalances(balances, await getMux3Tvl(chain, block))
  }

  return balances
}

Object.keys(readerContract).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, {[chain]: block}) => {
      return tvl(chain, block)
    }
  }
})