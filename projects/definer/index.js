const abi = require("./abi.json");
const config = {
  ethereum: {
    DEPLOY_BLOCK: 10819469,
    GLOBAL_CONFIG_ADDRESS: "0xa13B12D2c2EC945bCAB381fb596481735E24D585",
    SAVINGS_ADDRESS: "0x7a9E457991352F8feFB90AB1ce7488DF7cDa6ed5",
    CETH: "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5",
  },
  okexchain: {
    DEPLOY_BLOCK: 3674844,
    GLOBAL_CONFIG_ADDRESS: "0xAdD7b91FA4DC452A9C105F218236B28F17562555",
    SAVINGS_ADDRESS: "0xF3c87c005B04a07Dc014e1245f4Cff7A77b6697b",
    CETH: "0x621CE6596E0B9CcF635316BFE7FdBC80C3029Bec",
  },
  polygon: {
    DEPLOY_BLOCK: 22745105,
    GLOBAL_CONFIG_ADDRESS: "0x8dceE8E1555e1881fB16a546E86310aB573a6808",
    SAVINGS_ADDRESS: "0x7C6e294E6555cD70D02D53735C6860AD03A6b34F",
    CETH: "0xC1B02E52e9512519EDF99671931772E452fb4399",
  },
};

Object.keys(config).forEach(chain => {
  const { GLOBAL_CONFIG_ADDRESS, SAVINGS_ADDRESS, CETH, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      // Get TokenRegistry Address
      let tokenRegistryAddress = await api.call({ target: GLOBAL_CONFIG_ADDRESS, abi: abi["global:tokenInfoRegistry"], })

      // Get latest markets
      let markets = await api.call({ target: tokenRegistryAddress, abi: abi["tokenRegistry:getTokens"], });

      let bankAddress = await api.call({ target: GLOBAL_CONFIG_ADDRESS, abi: abi["global:bank"], })
      const amounts = await api.multiCall({ abi: abi["bank:getPoolAmount"], calls: markets, target: bankAddress, })
      api.add(markets, amounts)
      return api.sumTokens({ owner: SAVINGS_ADDRESS, token: CETH})

    }
  }
})