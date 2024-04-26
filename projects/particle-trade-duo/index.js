const config = {
  blast: {
    weth90d: '0xc932317385fDc794633f612874BD687eA987B151',
    usdb90d: '0x57A6CcB2d5663eF874c29b161dD7907c7673feb0',
    weth90dv2: '0xabF868bbe80550DC2EE4F8dFfcb06A5eb9B0760E',
    dusd90dv2: '0xBc65c01680E09FE14F466B00Cc2A9248a022F101',
  },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      let managers = config[chain]
      managers = Object.values(managers)
      const tokens = await api.multiCall({  abi: 'address:TOKEN', calls: managers})
      const vaults = await api.multiCall({  abi: 'address:VAULT', calls: managers})
      const yields = await api.multiCall({  abi: 'uint256:getTotalYield', calls: vaults})
      const principal = await api.multiCall({  abi: 'uint256:principal', calls: managers})
      api.add(tokens, yields)
      api.add(tokens, principal)
    }
  }
})