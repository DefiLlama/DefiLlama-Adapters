// const { nullAddress, sumTokensExport, } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
 
module.exports = {
  hela: {
    tvl: async (api) => {
      const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: ADDRESSES.hela.sUSD })
      api.add(ADDRESSES.hela.sUSD ,totalSupply)
    }
  }
}
