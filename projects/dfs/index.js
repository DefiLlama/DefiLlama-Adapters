const { get_account_tvl } = require("../helper/eos");

const tokens = [
  ["eosio.token", "EOS", "eos"],
  ["tethertether", "USDT", "tether"],
  ["btc.ptokens", "PBTC", "ptokens-btc"],
  ["token.defi", "BOX", "defibox"],
  ["minedfstoken", "DFS", "defis-network"],
  ["emanateoneos", "EMT", "emanate"],
  ["token.newdex", "DEX", "newdex-token"],
  ["chexchexchex", "CHEX", "chex-token"],
  ["everipediaiq", "IQ", "everipedia"],
  ["eosiotptoken", "TPT", "token-pocket"],
  ["core.ogx", "OGX", "organix"],
]

// https://apps.defis.network/
// AMM swap
async function eos() {
  return await get_account_tvl("defisswapcnt", tokens);
}

module.exports = {
  methodology: `DFS TVL is achieved by querying token balances from DFS's AMM swap liquidity smart contract.`,
  eos: {
    tvl: eos
  },
}
