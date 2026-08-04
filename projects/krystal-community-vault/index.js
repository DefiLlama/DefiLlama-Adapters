const community = require("./community.js");
const legacyShareVaults = require("./legacy-share-vaults.js");

const chains = [...new Set([...Object.keys(community.config), ...Object.keys(legacyShareVaults.config)])];

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async api => {
      // each returns early on a chain it has no factory on, so the union of chains is safe
      await Promise.all([
        community.tvl(api),
        legacyShareVaults.tvl(api)
      ]);
    },
  };
});

module.exports.methodology =
  "Sum of the liquidity positions and token balances held in every Community Vault, each a " +
  "publicly depositable vault whose owner actively manages LP positions across 2-4 tokens. " +
  "Also includes the legacy share vaults from the earlier factories, which value their whole " +
  "position - LP principal and uncollected fees - in a single principal token.";
