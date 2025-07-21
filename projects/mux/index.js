const abi = require("./abi.json");
const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { get } = require('../helper/http')

const readerContract = {
  arbitrum: '0x437CEa956B415e97517020490205c07f4a845168',
  bsc: '0x2981Bb8F9c7f7C5b9d8CA5e41C0D9cBbd89C7489',
  avax: '0xB33e3dDcE77b7679fA92AF77863Ae439C44c8519',
  fantom: '0xfb0DCDC30BF892Ec981255e7133AEcb8ea642b76',
  optimism: '0x572E9467b2585c3Ab6D9CbEEED9619Fd168254D5',
}

const arbUSDCAddress = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'

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

  // mux3 tvl
  if (chain === 'arbitrum') {
      let data = await get('https://app.mux.network/api/mux3/liquidityAsset')
      sdk.util.sumSingleBalance(balances,chain+':'+arbUSDCAddress,data.totalLiquidity*1e6)
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