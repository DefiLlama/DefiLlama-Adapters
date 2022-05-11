const { get_account_tvl } = require("../helper/eos");

const accounts = [
  "eosdtcntract", // EOS collateral
  "eosdtpbtcpos", // PBTC collateral
  "eosdtstfund1", // Stability Fund
  "eosdtstfund2", // Stability Fund
  "eosdtstfund3", // Stability Fund
]

const tokens = [
  ["btc.ptokens", "PBTC", "ptokens-btc"],
  ["eosio.token", "EOS", "eos"]
];

// Equilibrium
// https://eosdt.com
// https://equilibrium.io
async function eos() {
  return await get_account_tvl(accounts, tokens);
}

module.exports = {
  methodology: `Equilibrium TVL is achieved by querying token balances from EOSDT stable token smart contracts.`,
  eos: {
    tvl: eos
  },
}
