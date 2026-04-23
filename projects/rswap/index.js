const sdk = require("@defillama/sdk");
const { sumTokens, queryAddresses } = require('../helper/chain/radixdlt');
const { getConfig } = require('../helper/cache');
const { get } = require('../helper/http');

module.exports = {
   radixdlt: {
      tvl: async (api) => {
         const pools = await getConfig('rswap', null, {
            fetcher: async () => {
               let items = [];
               let cursor = 0;
               const limit = 100;
               do {
                  const { data, next_cursor } = await get(`https://dex.reddicks.meme/api/pairs-defillama?cursor=${cursor}&limit=${limit}`);
                  items.push(...data);
                  sdk.log(`Fetched ${items.length} pools`, data.length, next_cursor);
                  if (next_cursor != null) cursor = next_cursor;
               } while (data.length === limit && next_cursor != null);

               return items;
            }
         });
         const data = await queryAddresses({ addresses: pools.map((i) => i.address) });
         const owners = [];
         data.forEach((c) => {
            owners.push(c.details.state.fields.find((i) => i.field_name === 'base_pool').value);
            owners.push(c.details.state.fields.find((i) => i.field_name === 'quote_pool').value);
         });
         return sumTokens({ owners, api });
      },
   },
   timetravel: false,
};
