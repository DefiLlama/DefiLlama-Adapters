const sdk = require('@defillama/sdk');
const erc20Abi = require("../helper/abis/erc20.json")
const {getChainTransform} = require("../helper/portedTokens");
const config = require("./config");

module.exports = {
  methodology: 'Counts the amount of stables locked in Symbiosis protocol contracts: Portals V1, NervePools V1, Portals V2, OmniPool V2',
};

config.chains.forEach(chainInfo => {
  const {name: chain, stable, holders} = chainInfo
  module.exports[chain] = {
    tvl: async (_, _b, {[chain]: block}) => {
      const calls = holders.map((holder) => {
        return {target: stable, params: holder}
      })
      const output = await sdk.api.abi.multiCall({
        chain,
        block,
        abi: erc20Abi.balanceOf,
        calls,
      })
      const transformAddress = await getChainTransform(chain)
      const tvl = {}
      sdk.util.sumMultiBalanceOf(tvl, output, true, transformAddress)
      return tvl
    }
  }
})
