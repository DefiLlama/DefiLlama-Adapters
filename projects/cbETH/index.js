const ADDRESSES = require('../helper/coreAssets.json')
const { default: axios } = require("axios")
const token = ADDRESSES.ethereum.cbETH

module.exports = {
  ethereum: {
    tvl: async (timestamp, block) => {
      if(timestamp < Date.now()/1e3 - 3600){
        throw new Error("Only works for current info")
      }
      const data = await axios.get("https://api.exchange.coinbase.com/wrapped-assets/CBETH")
      // Convert cbETH supply to underlying ETH using the conversion rate
      const underlyingETH = data.data.circulating_supply * data.data.conversion_rate
      return {
        [token]: underlyingETH * 1e18
      }
    }
  }
}