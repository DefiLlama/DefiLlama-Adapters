const abi = require("./abi.json");
const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs')

const readerContract = {
  arbitrum: '0x6e29c4e8095B2885B8d30b17790924F33EcD7b33',
  bsc: '0xeAb5b06a1ea173674601dD54C612542b563beca1',
  avax: '0x5996D4545EE59D96cb1FE8661a028Bef0f4744B0',
  fantom: '0x29F4dC996a0219838AfeCF868362E4df28A70a7b',
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
  return balances
}

module.exports = {
  methodology: `This is the total value of all tokens in the MUXLP Pool. The liquidity pool consists of a token portfolio used for margin trading and third-party DEX mining.`,
}

Object.keys(readerContract).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, {[chain]: block}) => {
      return tvl(chain, block)
    }
  }
})