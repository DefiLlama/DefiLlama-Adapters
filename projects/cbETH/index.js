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
      return {
        [token]: data.data.circulating_supply * 1e18
      }
    }
  }
}