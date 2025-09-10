const config = {
  moonriver: ["0xc24D43093b44b7A9657571DDB79FEdf014eaef7d",],
  fantom: ["0x3938411fd77A5458721aF6B080b51008394568ef",],
}
module.exports = {
  methodology: "Measures the total value deposited in Scion vault contracts",
};

Object.keys(config).forEach(chain => {
  const vaults = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens  = await api.multiCall({  abi: 'address:UNDERLYING', calls: vaults })
      return api.sumTokens({ owners: vaults, tokens,     })
    }
  }
})
