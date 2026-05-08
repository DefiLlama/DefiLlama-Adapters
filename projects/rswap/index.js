const { sumTokens } = require('../helper/chain/radixdlt');
const { getConfig } = require('../helper/cache');
const { get } = require('../helper/http');

module.exports = {
  timetravel: false,
  radixdlt: {
    tvl: async (api) => {
      const pools = await getConfig('rswap', null, {
        fetcher: async () => {
          const items = [];
          let cursor = 0;
          const limit = 100;
          while (true) {
            const { data, next_cursor } = await get(
              `https://dex.reddicks.meme/api/pairs-defillama?cursor=${cursor}&limit=${limit}`
            );
            items.push(...data);
            if (next_cursor == null || data.length < limit) break;
            cursor = next_cursor;
          }
          return items;
        },
      });
      const owners = pools.flatMap(p => [p.basePool, p.quotePool]);
      return sumTokens({ owners, api });
    },
  },
};
