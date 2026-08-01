const { function_view } = require("../helper/chain/aptos")
const methodologies = require("../helper/methodologies")

let _poolData

function getPoolData() {
  if (!_poolData) {
    _poolData = new Promise(fetchPoolData)
  }

  return _poolData

  async function fetchPoolData(resolve, reject) {
    try {
      const poolAddresses = await getPoolAddresses()
      const poolInfos = await Promise.all(poolAddresses.map(getPoolInfo))
      resolve(poolInfos)
    } catch (e) { reject(e) }
  }

  async function getPoolAddresses() {
    const pools = await function_view({ functionStr: "0x68476f9d437e3f32fd262ba898b5e3ee0a23a1d586a6cf29a28add35f253f6f7::meso::pools" })
    return pools['data'].map(obj => { return { coin: obj.key, poolAddress: obj.value.inner } })
  }

  async function getPoolInfo(pool) {
    const [poolInfo] = await function_view({ functionStr: "0x68476f9d437e3f32fd262ba898b5e3ee0a23a1d586a6cf29a28add35f253f6f7::lending_pool::pool_info", args: [pool.poolAddress] })
    return { coin: pool.coin, poolSupply: poolInfo.total_reserves, totalDebt: poolInfo.total_debt }
  }
}

module.exports = {
  timetravel: false,
  methodology: methodologies.lendingMarket,
  aptos: {
    tvl: async (api) => {
      const poolInfos = await getPoolData()
      poolInfos.forEach(({ coin, poolSupply, }) => {
        api.add(coin, poolSupply)
      })
    },

    borrowed: async (api) => {
      const poolInfos = await getPoolData()
      poolInfos.forEach(({ coin, totalDebt }) => {
        api.add(coin, totalDebt)
      })
    }
  },
}