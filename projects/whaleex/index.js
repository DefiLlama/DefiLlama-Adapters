const { get_account_tvl } = require("../helper/chain/eos");

const tokens = [
    ["eosio.token", "EOS", "eos"],
    ["tokens.wal", "USDT", "tether"],
    ["tokens.wal", "BTC", "bitcoin"],
    ["eosiotptoken", "TPT", "token-pocket"],
    ["mkstaketoken", "KEY", "key"],
    ["everipediaiq", "IQ", "everipedia"],
    ["emanateoneos", "EMT", "emanate"],
    ["minedfstoken", "DFS", "defis-network"],
    ["vig111111111", "VIG", "vig"],
];

// WhaleEx
// https://www.whaleex.com
async function eos() {
  return await get_account_tvl("whaleextrust", tokens);
}

module.exports = {
  methodology: `WhaleEx's TVL is achieved by querying token balances from DEX smart contract.`,
  eos: {
    tvl: eos
  },
}