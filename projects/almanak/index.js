const { getLogs } = require("../helper/cache/getLogs");

const config = {
  ethereum: {
    vaults:
      [
        "0xDCD0f5ab30856F28385F641580Bbd85f88349124", // alUSD
        "0x5a97B0B97197299456Af841F8605543b13b12eE3", // alpUSD
      ],
  },
};


Object.keys(config).forEach((chain) => {
  const {vaults} = config[chain];
  module.exports[chain] = { 
    tvl: async (api) =>  {

      return await api.erc4626Sum2({
        calls: [...vaults],
      })
    }
}}
)
