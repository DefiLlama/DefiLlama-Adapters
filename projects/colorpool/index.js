const { get } = require("../helper/http")

module.exports = {
  misrepresentedTokens: true,
  chromia: {
    tvl: async (api) => {
      const {data} = await get('https://api-dex.colorpool.xyz/pool/list?page=1&limit=2500&sortField=tvl&sortOrder=desc')
      let total = 0
      data.forEach(i => total += Number(i.tvl))
      api.addUSDValue(total)
    }
  }
}