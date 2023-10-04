const { default: axios } = require("axios")
const token = '0xbe9895146f7af43049ca1c1ae358b0541ea49704'

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