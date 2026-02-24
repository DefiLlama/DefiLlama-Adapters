const { getResourceData } = require("../helper/chain/supra");

const SUPRA_CONTRACT_ADDRESS = "0x34a7ba846d2fbcdb35e36e5c4f6bd3860cb44e615172180ba888fa76584c9439"
const SUPRA_RESOURCE_ADDRESS = "0x468fd657f987f3b18a58eaad25b71dc3077b1199298c92a5242c93e54e129f8c"

function replaceAtWith0x(str) {
  if (str.startsWith('@')) {
    return '0x' + str.slice(1);
  } else {
    return str;
  }
}

async function getPoolsData(network) {
  let pool_address;
  let resource_address;
  switch (network) {
    case 'supra':
       pool_address = SUPRA_CONTRACT_ADDRESS;
      resource_address = SUPRA_RESOURCE_ADDRESS;
      break;
  }

  const res = await getResourceData(resource_address, `${pool_address}::pool::PoolConfigsMap`, network)

  const poolConfigsMap = res.pool_configs_map.data;

  return poolConfigsMap.map(item => ({
    coin: replaceAtWith0x(item.key),
    total_lend: item.value.total_lend,
    total_borrow: item.value.total_borrow
  }));
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL for all markets in Supralend.",
  supra: {
    tvl: async (api) => {
      const marketsData = await getPoolsData(api.chain)
      marketsData.forEach(({ coin, total_lend }) => {
        api.add(coin, total_lend)
      })
    },
    borrowed: async (api) => {
      const marketsData = await getPoolsData(api.chain)
      marketsData.forEach(({ coin, total_borrow }) => {
        api.add(coin, total_borrow)
      })
    },
  }
};