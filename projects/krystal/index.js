const autofarm = require("./autofarm.js");
const solana = require("./solana.js");
const legacyShareVaults = require("./legacy-share-vaults.js");

// One Krystal listing, matching what prod has always tracked plus the new auto-farm vaults:
//  - Auto-Farm Vaults (single-owner, AI-managed) on EVM + Solana
//  - the legacy share vaults (earlier vault generation) - kept here, their historical home
const chains = [...new Set([...Object.keys(autofarm.config), ...Object.keys(legacyShareVaults.config)])];

chains.forEach(chain => {
  module.exports[chain] = {
    // each returns early on a chain it has no factory on, so the union of chains is safe
    tvl: async api => {
      await Promise.all([
        autofarm.tvl(api),
        legacyShareVaults.tvl(api),
      ]);
    },
  };
});

module.exports.solana = { tvl: solana.tvl };

module.exports.isHeavyProtocol = true;
module.exports.methodology =
  "Sum of the liquidity positions and token balances held in every Auto-Farm Vault (a single-owner " +
  "vault where an AI Agent farms any pool or pair on the owner's behalf) plus the legacy share vaults " +
  "(the earlier generation of publicly depositable vaults, each valuing its whole position - LP " +
  "principal and uncollected fees - in a single principal token). On Solana the vaults are PDAs of the " +
  "Krystal auto-vault program, holding Raydium CLMM positions and idle SPL token balances.";
