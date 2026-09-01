const { function_view } = require("../helper/chain/aptos");
const contractAddress = "0xc49fd6643c260db7b453084751df8a5d0225b6f54dbf4fd1e2ea5298d309179e"

async function _getBalances() {
  return function_view({ functionStr: `${contractAddress}::treasury::balances`, type_arguments: [], args: [] })
}

async function _getTvl() {
  const tokenTvlMap = new Map();
  const balances = await _getBalances()
  for (const { key, value } of balances.data) {
    tokenTvlMap.set(key.inner, Number(value))
  }
  return tokenTvlMap
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL consists of total token balances held by the Collex contract treasury.",
  aptos: {
    tvl: async (api) => {
      const tokenTvlMap = await _getTvl()
      for (const [key, value] of tokenTvlMap) {
        api.add(key, value)
      }
    }
  }
}
