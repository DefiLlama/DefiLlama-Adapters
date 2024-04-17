const { cachedGraphQuery } = require('./helper/cache');

const { sumTokens, queryAddresses } = require('./helper/chain/radixdlt');
const { getConfig } = require('./helper/cache');
const { get } = require('./helper/http');
const sdk = require('@defillama/sdk');

const graphUrl = 'https://api.thegraph.com/subgraphs/name/omegasyndicate/defiplaza';

module.exports = {
   ethereum: {
      tvl: async (api) => {
         const { pools } = await cachedGraphQuery('defiplaza-ethereum', graphUrl, '{  pools {    id    tokens {      id    }  }}');
         const ownerTokens = pools.map((pool) => [pool.tokens.map((token) => token.id), pool.id]);
         return api.sumTokens({ ownerTokens });
      },
   },
   radixdlt: {
      tvl: async (api) => {
         const pools = await getConfig('defiplaza-radixdlt', null, {
            fetcher: async () => {
               let items = [];
               let cursor = 0;
               do {
                  const { data, next_cursor } = await get(`https://radix.defiplaza.net/api/pairs?cursor=${cursor}&limit=100`);
                  items.push(...data);
                  sdk.log(`Fetched ${items.length} pools`, data.length, next_cursor);
                  cursor = next_cursor;
               } while (items.length % 100 === 0 && cursor !== 0);

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