const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "Retrieve the total underlying FTM/sonic supply",
};


const config = {
  fantom: '0xB458BfC855ab504a8a327720FcEF98886065529b',
  sonic: '0xe5da20f15420ad15de0fa650600afc998bbe3955',
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