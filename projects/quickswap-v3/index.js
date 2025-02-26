const { uniV3Export } = require('../helper/uniswapV3')
const { cachedGraphQuery } = require('../helper/cache')
module.exports = uniV3Export({
  polygon: { factory: '0x411b0facc3489691f28ad58c47006af5e3ab3a28', fromBlock: 32610688, isAlgebra: true, permitFailure: true, },
  dogechain: { factory: '0xd2480162aa7f02ead7bf4c127465446150d58452', fromBlock: 837574, isAlgebra: true, },
  polygon_zkevm: { factory: '0x4B9f4d2435Ef65559567e5DbFC1BbB37abC43B57', fromBlock: 300, isAlgebra: true, },
  manta: { factory: '0x56c2162254b0E4417288786eE402c2B41d4e181e', fromBlock: 357492, },
  astrzk: { factory: '0x56c2162254b0E4417288786eE402c2B41d4e181e', fromBlock: 93668, },
  imx: { factory: '0x56c2162254b0E4417288786eE402c2B41d4e181e', fromBlock: 356091, },
  xlayer: { factory: '0xd2480162aa7f02ead7bf4c127465446150d58452', fromBlock: 277686, isAlgebra: true, },
  soneium: { factory: '0x8Ff309F68F6Caf77a78E9C20d2Af7Ed4bE2D7093', fromBlock: 1681559, isAlgebra: true, },
})

async function tvl(api) {
  const { pools } = await cachedGraphQuery('quickswap-v3/' + api.chain, 'https://graph-node.dogechain.dog/subgraphs/name/quickswap/dogechain-info', `{
    pools(first:1000) {
      token0 {
        id
      }
      token1 {
        id
      }
      id
    }
  }`)
  const ownerTokens = pools.map(p => [[p.token0.id, p.token1.id], p.id])
  return api.sumTokens({ ownerTokens, })
}

module.exports.dogechain.tvl = tvl