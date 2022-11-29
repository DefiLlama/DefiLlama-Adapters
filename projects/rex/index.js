const { get_account_tvl } = require("../helper/chain/eos");

// REX (Resource Exchange)
// https://eosauthority.com/rex/statistics?network=eos
// https://developers.eos.io/manuals/eos/v2.1/cleos/command-reference/system/system-rex
async function eos() {
  return await get_account_tvl("eosio.rex", [["eosio.token", "EOS", "eos"]]);
}

module.exports = {
  methodology: `REX (Resource Exchange) TVL is achieved by querying token balances from [eosio.rex] system account.`,
  eos: {
    tvl: eos
  },
}
