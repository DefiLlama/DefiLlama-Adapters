const { get_account_tvl } = require("../helper/chain/eos");

const tokens = [
    ["eosio.token", "EOS", "eos"],
    ["tethertether", "USDT", "tether"],
    ["organixtoken", "OGX", "organix"],

];

const accounts = [
    "eosdmdpool11",
    "eosdmdpool12",
    "eosdmdpool13",
]

// DMD Finance
// https://dmd.finance/
async function eos() {
  return await get_account_tvl(accounts, tokens);
}

module.exports = {
  methodology: `DMD Finance's TVL is achieved by querying token balances from DMD staking smart contract(s).`,
  eos: {
    tvl: eos
  },
}