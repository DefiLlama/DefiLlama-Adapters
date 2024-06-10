const { getStorage, getBigMapById, getTezosBalance } = require('../helper/chain/tezos')

const OVEN_FACTORY = 'KT1GWnsoFZVHGh7roXEER3qeCcgJgrXT3de2'
const CLMM = 'KT1H5b7LxEExkFd2Tng77TfuWbM5aPvHstPr'

module.exports = {
  timetravel: false,
  tezos: {
    tvl: async () => {
      const data = await getStorage(OVEN_FACTORY)
      const pools = await getBigMapById(data.ovens);
      let sum = await getTezosBalance(CLMM)
      Object.values(pools).forEach(i => {
        sum += i.tez_balance / 1e6
      })
      return { tezos: sum }
    },
  }
}