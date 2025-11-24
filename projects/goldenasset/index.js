const sdk = require('@defillama/sdk');
const { fetchURL } = require('../helper/utils');

const PRICE_DISCOUNT = 0.098;

module.exports = {
  misrepresentedTokens: true,
  start: 1727914080, // Protocol launch: October 3, 2024 UTC

  sei: {
    tvl: async (api) => {
      // The timestamp here is a number (seconds since epoch)
      // 1. Fetch the total token supply
      const totalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: '0x372B2dC06478AA2c8182EeE0f12eA0e9A15E2913',
      });

      // 2. Fetch the historical price
      const url = `https://api.gemswap.org/prices/gem?adjustTo=2024-12-03`;
      const response = await fetchURL(url);
      const { price: currentPrice, history } = response.data;

      // 3. Convert the timestamp to an ISO date string at UTC 00:00
      const dateVal = new Date(Number(api.timestamp) * 1000);
      if (isNaN(dateVal.getTime())) {
        throw new Error(`Invalid timestamp: ${api.timestamp}`);
      }
      const isoDateKey = dateVal
        .toISOString()
        .split('T')[0] + 'T00:00:00.000Z';

      // 4. Retrieve the historical price from the history (fallback to currentPrice)
      const rawPrice = history[isoDateKey] !== undefined
        ? history[isoDateKey]
        : currentPrice;

      // 5. Apply the discount
      const price = rawPrice * (1 - PRICE_DISCOUNT);

      // 6. Calculate TVL in USD
      const supply = totalSupply / 1e18;
      return { 'usd-coin': supply * price };
    },
  },
};
