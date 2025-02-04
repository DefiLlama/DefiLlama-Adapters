const mapping = {
  btr: {
    bfbtc: '0xCdFb58c8C859Cb3F62ebe9Cf2767F9e036C7fb15',
  },
  bsc: {
    bfbtc: '0x623F2774d9f27B59bc6b954544487532CE79d9DF',
  }
}
const exportObject = {}
Object.keys(mapping).forEach(chain => {
  exportObject[chain] = {
    tvl: async (api) => {
      const supply = await api.call({ abi: 'erc20:totalSupply', target: mapping[chain].bfbtc })
      api.add(mapping[chain].bfbtc, supply)
    }
  }
})
module.exports = exportObject