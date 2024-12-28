const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')

const CHEFS = {
  "avax": "0x5A9710f3f23053573301C2aB5024D0a43A461E80",
  "bsc": "0xD92bc4Afc7775FF052Cdac90352c39Cb6a455900",
  "fantom": "0xC90812E4502D7848E58e53753cA397A201f2e99B"
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
}

Object.keys(CHEFS).forEach(chain => {
  const chef = CHEFS[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const lp = await api.fetchList({
        lengthAbi: abi.poolLength,
        itemAbi: abi.poolInfo,
        target: chef,
      })      
      const tokens = lp.map(i => i.lpToken)
      return sumTokens2({ api, owner: chef,  tokens, resolveLP: true, })
    }
  }
})