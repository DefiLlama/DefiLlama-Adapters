const { get_account_tvl } = require("../helper/eos");

const accounts = [
  "bullishfunds",
  "j4obibe5lfv1", // cold wallet
  "vbdoctdtpwb1", // cold wallet
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
