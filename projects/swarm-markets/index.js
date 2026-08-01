const { v1Tvl } = require("../helper/balancer")
const sdk = require('@defillama/sdk')

const config = {
  polygon: { factory: '0x991fd11876a438af7bcadc98f4b3cf201bdf6191', fromBlock: 23158523, wrapper: '0x6cdde4ed9165405c1914b229d3cd4ac9c354c331', },
  ethereum: { factory: '0x9186503af1d7d3317b4c2c44a815be984838c296', fromBlock: 12432945, wrapper: '0x2b9dc65253c035eb21778cb3898eab5a0ada0cce', },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, wrapper } = config[chain]
  const tvlFunc = v1Tvl(factory, fromBlock)
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = {}
      const balances_ = await tvlFunc(api)
      const tokens = Object.keys(balances_)
      const uTokens = await api.multiCall({ abi: 'function xTokenToToken(address) view returns (address)', target: wrapper, calls: tokens.map(i => i.replace(api.chain + ':', '')) })
      tokens.forEach((v, i) => {
        sdk.util.sumSingleBalance(balances, uTokens[i], balances_[v], api.chain)
      })
      return balances
    }
  }
})