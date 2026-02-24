const { get_account_tvl } = require("../helper/chain/eos");

async function eos() {
  return await get_account_tvl("eosio.evm", [["eosio.token", "EOS", "eos"]]);
}

module.exports = {
  methodology: `EOS EVM TVL is achieved by querying token balances from [eosio.evm] system account.`,
  eos: {
    tvl: eos
  },
}
