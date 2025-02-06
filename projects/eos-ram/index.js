const { get_account_tvl } = require("../helper/chain/eos");

// RAM market
// https://docs.eosnetwork.com/docs/latest/core-concepts/resources
// https://newdex.io/resources/ram
// https://eosauthority.com/wallet/ram?network=eos
// https://eoseyes.com/ram
async function eos() {
  return await get_account_tvl("eosio.ram", [["eosio.token", "EOS", "eos"]]);
}

module.exports = {
  methodology: `EOS RAM TVL is achieved by querying token balances from [eosio.ram] system account.`,
  eos: {
    tvl: eos
  },
}
