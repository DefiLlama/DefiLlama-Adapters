const { get_account_tvl } = require("../helper/chain/eos");

const tokens = [
    ["chexchexchex", "CHEX", "chex-token"],
    ["eosio.token", "EOS", "eos"]
];

// Chintai
// https://chintai.io/
async function eos() {
  return await get_account_tvl("chintailease", tokens);
}

module.exports = {
  methodology: `Chintai TVL is achieved by querying token balances from Chintai leasing smart contract.`,
  eos: {
    tvl: eos
  },
}