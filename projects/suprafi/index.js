module.exports = {
  methodology: "Retrieve the total underlying sonic supply",
}

const config = {
  sonic: "0x6ba47940f738175d3f8c22aa8ee8606eaae45eb2",
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vault = config[chain]
      const bal = await api.call({  abi: 'uint256:totalAssets', target: vault})
      api.addGasToken(bal)
    }
  }
})
