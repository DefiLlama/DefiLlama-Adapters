const config = {
  ethereum: {
    vaults:[
      "0xDCD0f5ab30856F28385F641580Bbd85f88349124", // alUSD
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
