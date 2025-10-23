const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const token = ADDRESSES.ethereum.cbETH

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: async () => {
      const data = await get("https://api.exchange.coinbase.com/wrapped-assets/CBETH")
      return {
        [token]: data.circulating_supply * 1e18
      }
    }
  }
}