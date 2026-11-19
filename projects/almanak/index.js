const config = {
  ethereum: {
    vaults:[
      "0xDCD0f5ab30856F28385F641580Bbd85f88349124", // alUSD
      "0x5a97B0B97197299456Af841F8605543b13b12eE3", // alpUSD
    ],
  },
  base: {
    vaults: [
      "0xb523EeE5d77FA3E5a03e4fcD45CdD2B2C762bE58", // basedUSD
    ],
  },
};

module.exports.methodology = 'Count all asset deposited in Almanak vaults'
Object.keys(config).forEach((chain) => {
  module.exports[chain] = { 
    tvl: async (api) =>  {
      return await api.erc4626Sum2({
        calls: config[chain].vaults,
      })
    }
  }}
)
