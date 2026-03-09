const SCNR = {
  GCKLAY: '0x999999999939ba65abb254339eec0b2a0dac80e9'
}

module.exports = {
  klaytn: {
    tvl: async (api) => {
      const bal = await api.call({  abi: 'erc20:totalSupply', target: SCNR.GCKLAY,})
      api.addGasToken(bal)
    }
  },
}