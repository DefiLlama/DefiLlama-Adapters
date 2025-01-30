const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "Retrieve the total underlying sonic supply",
};


const config = {
  sonic: "0x6ba47940f738175d3f8c22aa8ee8606eaae45eb2",
}

Object.keys(config).forEach(chain => {
  const liquidStakingContract = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const abi = chain === 'fantom' ? 'totalFTMWorth' : 'totalAssets'
      const supply = await api.call({ abi: "uint256:" + abi, target: liquidStakingContract, });
      api.addGasToken(supply)
      return sumTokens2({ api })
    }
  }
})