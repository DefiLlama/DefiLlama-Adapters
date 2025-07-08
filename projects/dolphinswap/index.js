const { get_account_tvl } = require("../helper/chain/eos");

const tokens = [
    ["eosio.token", "EOS", "eos"],
    ["tethertether", "USDT", "tether"],
    ["btc.ptokens", "PBTC", "ptokens-btc"],
    ["organixtoken", "OGX", "organix"],
    ["eosdmdtokens", "DMD", "dmd"],

];

// DMD Finance
// https://dmd.finance/
async function eos() {
  return await get_account_tvl("dolphinsswap", tokens);
}

module.exports = {
  methodology: `DolphinSwap's TVL is achieved by querying token balances from Swap smart contract.`,
  eos: {
    tvl: eos
  },
}