module.exports = {
  misrepresentedTokens: true,
  start: '2024-03-01', // Friday, March 1, 2024 12:00:00 AM
  methodology: "Aggregates total value of each Harmonix vault"
}

const config = {
  arbitrum:  "0x7274463BF93E0058481042Cbd6e0cc73042E6285",
  ethereum:  "0xC7C8Cdd1E9817Fc98AD1b05cD3633c6471A9473b",
  base:  "0x45dC73fB760f2382Cfd11e28C0Dd0a3A8d3E4C31",
}

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const bal = await api.call({  abi: 'uint256:getVaultsTVL', target: factory })
      api.addCGToken("tether", bal/1e6)
    }
  }
})