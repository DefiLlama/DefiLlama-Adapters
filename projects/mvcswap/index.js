const axios = require("axios")
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  mvc: {
	tvl: async () => {
      const result = await axios.get('https://api.mvcswap.com/swap/allpairs', {
		headers: {
		'Accept-Encoding': 'gzip'
		}
	})
		const data = result.data.data;
		return transformDexBalances({
			chain: 'mvc',
			data: Object.keys(data).map(i => ({
				token0: data[i].token1.tokenID,
				token1: data[i].token2.tokenID,
				token0Bal: data[i].token1Amount,
				token1Bal: data[i].token2Amount,
			}))
		})
    }
  }
}
