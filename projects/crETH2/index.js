const token = '0x49d72e3973900a195a155a46441f0c08179fdb64'

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const supply = await api.call({  abi: 'erc20:totalSupply', target: token })
      api.addGasToken(supply)
    }
  }
}