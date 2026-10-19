const config = {
  arbitrum: {
    collateralContract: '0xaf8ced28fce00abd30463d55da81156aa5aeeec2',
    // token() and collateral(product) started reverting (contract wound down); the collateral token
    // was read at arbitrum block 458085244 - count what the collateral contract still holds
    token: '0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b', // DSU
  }
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { collateralContract, token, } = config[chain]
  module.exports[chain] = {
    tvl: (api) => api.sumTokens({ owner: collateralContract, tokens: [token] })
  }
})
