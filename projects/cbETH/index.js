const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const BigNumber = require('bignumber.js')

const ETH = ADDRESSES.null

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: async () => {
      const data = await get("https://api.exchange.coinbase.com/wrapped-assets/CBETH")
      // Convert circulating cbETH to the amount of underlying ETH backing the wrapper
      const circulatingSupply = new BigNumber(data.circulating_supply || 0)
      const conversionRate = new BigNumber(data.conversion_rate || 0)
      const underlyingETH = circulatingSupply.times(conversionRate)

      return {
        [ETH]: underlyingETH.shiftedBy(18).toFixed(0),
      }
    }
  }
}