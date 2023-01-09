const { get_account_tvl } = require("../helper/chain/eos");

const accounts = [
  "bullishfunds", // deposit account
  "j4obibe5lfv1", // cold account
  "vbdoctdtpwb1", // withdraw account
];

// Bullish
// https://bullish.com
async function eos() {
  return await get_account_tvl(accounts, [["eosio.token", "EOS", "eos"]]);
}

module.exports = {
  methodology: `Bullish TVL is achieved by querying token balances from Bullish funds account.`,
  eos: {
    tvl: eos
  },
}
