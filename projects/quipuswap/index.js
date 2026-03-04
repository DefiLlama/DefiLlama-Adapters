const { sumTokens2, getBigMapById } = require('../helper/chain/tezos');

// ✅ All confirmed Quipuswap legacy factories with live token_to_exchange maps
const factories = [
  { name: 'FA1.2 Factory Old 1', mapId: 940 },
  { name: 'FA1.2 Factory Old 2', mapId: 1453 },
  { name: 'FA1.2 Factory',       mapId: 3999 },
  { name: 'FA2 Factory Old 1',   mapId: 1466 },
  { name: 'FA2 Factory Old 2',   mapId: 962 },
  { name: 'FA2 Factory Old 3',   mapId: 1823 },
  { name: 'FA2 Factory',         mapId: 4013 },
];

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  start: 1617148800, // March 2021
  methodology:
    "TVL includes all legacy Quipuswap FA1.2 and FA2 pools using token_to_exchange big_map entries from 7 verified factories deployed between March–June 2021.",
  tezos: {
    tvl: async () => {
      let owners = [];

      for (const { mapId } of factories) {
        const entries = await getBigMapById(mapId);
        const poolAddresses = Object.values(entries);
        owners.push(...poolAddresses);
      }

      return sumTokens2({ owners, includeTezos: true });
    },
  },
};
