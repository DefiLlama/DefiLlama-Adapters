const ADDRESSES = require('../helper/coreAssets.json')

const BUIDL = "0x7712c34205737192402172409a8f7ccef8aa2aec"

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({
        target: BUIDL,
        abi: 'erc20:totalSupply'
      })
      return api.add(ADDRESSES.ethereum.USDC, totalSupply)
    }
  }
}