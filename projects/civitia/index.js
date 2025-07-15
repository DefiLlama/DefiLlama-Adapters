const { get } = require('../helper/http.js');

module.exports = {
  timetravel: false,
  civitia: {
    tvl: async () => {
        const res = await get('https://rest-civitia-1.anvil.asia-southeast.initia.xyz/cosmos/bank/v1beta1/supply/by_denom?denom=l2%2F2b2d36f666e98b9eecf70d6ec24b882b79f2c8e2af73f54f97b8b670dbb87605')
        return { 'coingecko:initia': res.amount.amount / 1e6 }
    }
  }
};
