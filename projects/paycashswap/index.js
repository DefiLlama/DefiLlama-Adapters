const { get_account_tvl } = require("../helper/chain/eos");

const tokens = [
  ["eosio.token", "EOS", "eos"],
  ["tethertether", "USDT", "tether"],
]

// PayCash Swap
// https://paycash.app/
async function eos() {
  return await get_account_tvl("swap.pcash", tokens);
}

module.exports = {
  timetravel: false,
  methodology: `PayCash Swap TVL is computed by querying token balances from the 'swap.pcash' contract. Only external tokens (EOS, USDT) are counted, excluding project-owned tokens like MLNK and RUBCASH.`,
  eos: {
    tvl: eos
  }
}