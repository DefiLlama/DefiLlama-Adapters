const { sumTokens2 } = require("./unwrapLPs")
const { getCache, setCache, } = require('../helper/cache')
const ADDRESSES = require('../helper/coreAssets.json')

function iziswapExport({ poolHelpers, blacklistedTokens = [] }) {
  return async (api) => {
    const isMerlin = api.chain === 'merlin'
    const toa = []
    const chunkSize = isMerlin ? 3 : 10

    for (const manager of poolHelpers) {
      let foundLastPool = false
      const poolMetaData = []
      const key = `${api.chain}-${manager}`
      const { allPools = [], allPoolMetas = [], } = (await getCache('iziswap', key) ?? {})
      let i = allPools.length + 1
      do {
        const calls = []
        for (let j = i; j < i + chunkSize; j++)
          calls.push(j)
        i += chunkSize
        const poolMetas = await api.multiCall({ target: manager, abi: abi.poolMetas, calls, })
        for (const output of poolMetas) {
          if (output.tokenX === ADDRESSES.null && output.fee === '0') {
            foundLastPool = true
            break;
          }
          poolMetaData.push(output)
        }
      } while (!foundLastPool)

      const poolCalls = poolMetaData.map(i => ({ params: [i.tokenX, i.tokenY, i.fee] }))
      const pools = await api.multiCall({ target: manager, abi: abi.pool, calls: poolCalls, })

      allPools.push(...pools)
      allPoolMetas.push(...poolMetaData.map(i => ({ tokenX: i.tokenX, tokenY: i.tokenY })))
      allPools.forEach((output, i) => toa.push([allPoolMetas[i].tokenX, output], [allPoolMetas[i].tokenY, output],))
      await setCache('iziswap', key, { allPools, allPoolMetas, })
    }

    return sumTokens2({ tokensAndOwners: toa, api, blacklistedTokens, permitFailure: !isMerlin, sumChunkSize: isMerlin ? 1 : 100,})
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