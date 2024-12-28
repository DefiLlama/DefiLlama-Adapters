const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: {
    pools: [
      '0x1eBB487B42530D511091DC6bC4359ee767ad0d16', // bluechip
      '0x0155d3f48e51e108f0dfF56F6EFBeA1A870B3cE7', // altcoin
      '0x20A1012B79e8F3cA3f802533c07934eF97398dA7',  // degen
    ],
  }
}

Object.keys(config).forEach(chain => {
  const { pools } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({  abi: 'address:asset', calls: pools})
      return sumTokens2({ api, tokensAndOwners2: [tokens, pools] })
    }
  }
})