const { query, queryContract } = require('../helper/terra')
const { PromisePool } = require('@supercharge/promise-pool')

function getAssetInfo(asset) {
  return [asset.info.native_token?.denom ?? asset.info.token?.contract_addr, Number(asset.amount)]
}

const terra = {
  getAllPairs: async function (factory) {
    let allPairs = []
    let currentPairs;
    do {
      currentPairs = (await query(`contracts/${factory}/store?query_msg={"pairs":{"limit":30${allPairs.length === 0 ? "" : `,"start_after":${JSON.stringify(allPairs[allPairs.length - 1].asset_infos)}`
        }}}`, undefined, false)).pairs
      allPairs = [...allPairs, ...currentPairs];
    } while (currentPairs.length > 0)
    return allPairs.map(pair => pair.contract_addr)
  },

  getFactoryTvl: (factory) => {
    return async () => {
      const pairs = await terra.getAllPairs(factory, undefined, false)

      let ustTvl = 0;
      const balances = {}
      const prices = {}
      const addPairToTVL = async (pair, index) => {
        const { assets } = await query(`contracts/${pair}/store?query_msg={"pool":{}}`, undefined, false)
        const [token0, amount0] = getAssetInfo(assets[0])
        const [token1, amount1] = getAssetInfo(assets[1])
        if (token0 === "uusd") {
          ustTvl += amount0 * 2
          if (amount1 !== 0) {
            prices[token1] = amount0 / amount1
          }
        } else if (token1 === 'uusd') {
          ustTvl += amount1 * 2
          if (amount0 !== 0) {
            prices[token0] = amount1 / amount0
          }
        } else if (token1 === "uluna") {
          balances[token1] = (balances[token1] ?? 0) + amount1 * 2
        } else {
          balances[token0] = (balances[token0] ?? 0) + amount0
          balances[token1] = (balances[token1] ?? 0) + amount1
        }
      }
      await PromisePool
        .withConcurrency(31)
        .for(pairs)
        .process(addPairToTVL)
      Object.entries(balances).map(entry => {
        const price = prices[entry[0]]
        if (price) {
          ustTvl += entry[1] * price
        }
      })
      return {
        'terrausd': ustTvl / 1e6
      }
    }
  }
}


async function getAllPairs(factory, isTerra2) {
  let allPairs = []
  let currentPairs;
  do {
    const queryStr = `{"pairs": { "limit": 30 ${allPairs.length ? `,"start_after":${JSON.stringify(allPairs[allPairs.length - 1].asset_infos)}` : ""} }}`
    currentPairs = (await queryContract({ contract: factory, isTerra2, data: queryStr })).pairs
    allPairs.push(...currentPairs)
  } while (currentPairs.length > 0)
  const dtos = []
  const getPairPool = (async (pair) => {
    const pairRes = await queryContract({ contract: pair.contract_addr, isTerra2, data: { pool: {} } })
    const pairDto = {}
    pairDto.assets = []
    pairDto.addr = pair.contract_addr
    pairRes.assets.forEach((asset, idx) => {
      const [addr, balance] = getAssetInfo(asset)
      pairDto.assets.push({ addr, balance })
    })
    dtos.push(pairDto)
  })
  await PromisePool
    .withConcurrency(31)
    .for(allPairs)
    .process(getPairPool)
  return dtos
}

function getFactoryTvl(factory, isTerra2 = false) {
  if (!isTerra2)
    return terra.getFactoryTvl(factory)
  return async () => {
    const pairs = (await getAllPairs(factory, isTerra2)).filter(pair => (pair.assets[0].balance && pair.assets[1].balance))

    const routes = new Map()
    pairs.forEach(pair => {
      const fromSet = routes.get(pair.assets[0].addr) ?? new Set()
      fromSet.add(pair)
      const toSet = routes.get(pair.assets[1].addr) ?? new Set()
      toSet.add(pair)
      routes.set(pair.assets[0].addr, fromSet)
      routes.set(pair.assets[1].addr, toSet)
    })

    const tokenQueue = ["uluna"]
    const pricePerLuna = { "uluna": 1 }
    const visited = {}
    let totalLunaCount = 0
    while (tokenQueue.length) {
      const from = tokenQueue.shift()
      const currentSet = routes.get(from)
      currentSet.forEach(pair => {
        if (visited[pair.addr]) {
          return
        }
        visited[pair.addr] = true
        if (!pair.assets[0].balance || !pair.assets[1].balance) {
          return
        }
        const fromAsset = pair.assets[0].addr === from ? pair.assets[0] : pair.assets[1]
        const toAsset = pair.assets[0].addr === from ? pair.assets[1] : pair.assets[0]
        pricePerLuna[toAsset.addr] = toAsset.balance / fromAsset.balance * pricePerLuna[from]

        totalLunaCount += (fromAsset.balance / pricePerLuna[fromAsset.addr] + toAsset.balance / pricePerLuna[toAsset.addr])
        tokenQueue.push(toAsset.addr)
      })
    }
    return {
      "terra-luna-2": totalLunaCount / 1e6
    }
  }
}

module.exports = {
  getFactoryTvl
}
