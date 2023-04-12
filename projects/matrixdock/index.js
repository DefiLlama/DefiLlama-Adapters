module.exports = {
  ethereum: {
    tvl: async (...args) => {
      const { api } = args[3]
      const STBT = '0x530824DA86689C9C17CdC2871Ff29B058345b44a'
      api.add(STBT, await api.call({ target: STBT, abi: 'erc20:totalSupply'}))
    }
  }
}