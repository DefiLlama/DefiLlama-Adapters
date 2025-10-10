
const config = {
  ethereum: {
    chainId: 1, blacklistedTokens: [
      '0x71eeba415a523f5c952cc2f06361d5443545ad28', // XDAO
    ]
  },
}


Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async () => {
      return {}
    }
  }
})
