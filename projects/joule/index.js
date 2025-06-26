const { getResource } = require("../helper/chain/aptos")

const APTOS_CONTRACT_ADDRESS = "0x2fe576faa841347a9b1b32c869685deb75a15e3f62dfe37cbd6d52cc403a16f6"
const MOVEMENT_CONTRACT_ADDRESS = "0x6a164188af7bb6a8268339343a5afe0242292713709af8801dafba3a054dc2f2"
const APTOS_RESOURCE_ADDRESS = "0x7f83b020b8ab60dbdc4208029fa6aa0804bf5a71eeaca63382d24622b9e6f647"
const MOVEMENT_RESOURCE_ADDRESS = "0x26f1ad9433746c22fe2f59f551a4218e57787683375747793f827a640c28e659"

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
    case 'aptos':
      pool_address = APTOS_CONTRACT_ADDRESS;
      resource_address = APTOS_RESOURCE_ADDRESS;
      break;
    case 'move':
       pool_address = MOVEMENT_CONTRACT_ADDRESS;
      resource_address = MOVEMENT_RESOURCE_ADDRESS;
      break;
  }

  const res = await getResource(resource_address, `${pool_address}::pool::PoolConfigsMap`, network)

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
    "Aggregates TVL for all markets in Joule.",
  aptos: {
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
  },
  move: {
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
