const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const token = ADDRESSES.ethereum.cbETH

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: async () => {
      const data = await get("https://api.exchange.coinbase.com/wrapped-assets/CBETH")
      // Convert cbETH supply to underlying ETH using the conversion rate
      const underlyingETH = data.circulating_supply * data.conversion_rate
      return {
        [token]: underlyingETH * 1e18
      }
    }
  }
}