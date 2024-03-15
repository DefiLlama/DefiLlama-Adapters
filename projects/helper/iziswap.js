const { sumTokens2 } = require("./unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

function iziswapExport({ poolHelpers, blacklistedTokens = []}) {
  return async (_, _1, _2, { api }) => {
    const toa = [] 
    const chunkSize = 10
    const allPools = []
    const allPoolMetas = []
  
    for(const manager of poolHelpers) {
      let i = 1
      let foundLastPool = false
      const poolMetaData = []
      do {
        const calls = []
        for (let j = i; j < i + chunkSize; j++)
          calls.push(j)
        i += chunkSize
        const poolMetas = await api.multiCall({
          target: manager,
          abi: abi.poolMetas,
          calls,
        })
        for (const output of poolMetas) {
          if (output.tokenX === ADDRESSES.null && output.fee === '0') {
            foundLastPool = true
            break;
          }
          poolMetaData.push(output)
        }
      } while (!foundLastPool)
    
      const poolCalls = poolMetaData.map(i => ({ params: [i.tokenX, i.tokenY, i.fee] }))
      const pools = await api.multiCall({
        target: manager,
        abi: abi.pool,
        calls: poolCalls,
      })
  
      allPools.push(...pools)
      allPoolMetas.push(...poolMetaData)
    }
  
    allPools.forEach((output, i) => toa.push([allPoolMetas[i].tokenX, output], [allPoolMetas[i].tokenY, output],))
    return sumTokens2({ tokensAndOwners: toa, api, blacklistedTokens, permitFailure: true})

  }
}

const abi = {
  liquidities: "function liquidities(uint256) view returns (int24 leftPt, int24 rightPt, uint128 liquidity, uint256 lastFeeScaleX_128, uint256 lastFeeScaleY_128, uint256 remainTokenX, uint256 remainTokenY, uint128 poolId)",
  liquidityNum: "uint256:liquidityNum",
  pool: "function pool(address tokenX, address tokenY, uint24 fee) view returns (address)",
  poolMetas: "function poolMetas(uint128) view returns (address tokenX, address tokenY, uint24 fee)",
}

module.exports = {
  iziswapExport
}