const autofarm = require("./autofarm.js");
const solana = require("./solana.js");

Object.keys(autofarm.config).forEach(chain => {
  module.exports[chain] = { tvl: autofarm.tvl };
});

module.exports.solana = { tvl: solana.tvl };

module.exports.isHeavyProtocol = true;
module.exports.methodology =
  "Sum of the liquidity positions and token balances held in every Auto-Farm Vault, each a " +
  "single-owner vault where an AI Agent farms any pool or pair on the owner's behalf. On Solana " +
  "the vaults are PDAs of the Krystal auto-vault program, holding Raydium CLMM positions and " +
  "idle SPL token balances.";
