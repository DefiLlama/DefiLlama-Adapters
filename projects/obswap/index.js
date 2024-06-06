const { get_account_tvl } = require("../helper/chain/eos");

const tokens = [
  ["eosio.token", "EOS", "eos"],
  ["tethertether", "USDT", "tether"],
  ["btc.ptokens", "PBTC", "ptokens-btc"],
  ["token.defi", "BOX", "defibox"],
  ["minedfstoken", "DFS", "defis-network"],
  ["emanateoneos", "EMT", "emanate"],
  ["dappservices", "DAPP", "dapp"],
  ["token.newdex", "DEX", "newdex-token"],
  ["chexchexchex", "CHEX", "chex-token"],
  ["everipediaiq", "IQ", "everipedia"],
  ["eosiotptoken", "TPT", "token-pocket"],
  ["core.ogx", "OGX", "organix"],
  ["pizzatotoken", "PIZZA", "pizza-usde"],
]

// https://swap.defiob.com
// OBSwap
async function eos() {
  return await get_account_tvl("swap.ob", tokens);
}

module.exports = {
  methodology: `OBSwap TVL is achieved by querying token balances from their swap pool smart contract.`,
  eos: {
    tvl: eos
  },
}
