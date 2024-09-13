const { getResource } = require("../helper/chain/aptos")

const CONTRACT_ADDRESS = "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6"

async function getPoolsData() {
  const res = await getResource("0x7f83b020b8ab60dbdc4208029fa6aa0804bf5a71eeaca63382d24622b9e6f647", `${CONTRACT_ADDRESS}::pool::PoolConfigsMap`)

  const poolConfigsMap = res.pool_configs_map.data;
  
  return poolConfigsMap.map(item => ({
    coin: item.key,
    total_lend: item.value.total_lend,
    total_borrow: item.value.total_borrow
  }));
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL for all markets in Joule.",
  aptos: {
    tvl: async (api) => {
      const marketsData = await getPoolsData()
      marketsData.forEach(({coin, total_lend}) => {
        api.add(coin, total_lend)
      })
    },
    borrowed: async (api) => {
      const marketsData = await getPoolsData()
      marketsData.forEach(({coin, total_borrow}) => {
        api.add(coin, total_borrow)
      })    
    },
  }
};
