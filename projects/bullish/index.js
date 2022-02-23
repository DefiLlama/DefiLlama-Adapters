const { get_account_tvl } = require("../helper/eos");

// Bullish
// https://bullish.com
async function eos() {
  return await get_account_tvl("bullishfunds", [["eosio.token", "EOS", "eos"]]);
}

module.exports = {
  methodology: `Bullish TVL is achieved by querying token balances from Bullish funds account.`,
  eos: {
    tvl: eos
  },
}