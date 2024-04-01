const { transformDexBalances } = require('../helper/portedTokens')
const  ADDRESSES = require('../helper/coreAssets.json')
const { get } = require("../helper/http")

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  mvc: {
	tvl: async () => {
      const result = await get('https://api.mvcswap.com/swap/allpairs', {
		headers: {
		'Accept-Encoding': 'gzip'
		}
	})
		const data = result.data;
		return transformDexBalances({
			chain: 'mvc',
			data: Object.keys(data).map(i => ({
				token0: data[i].token1.tokenID || ADDRESSES.null,
				token1: data[i].token2.tokenID || ADDRESSES.null,
				token0Bal: data[i].token1Amount,
				token1Bal: data[i].token2Amount,
			}))
		})
    }
  }
}
