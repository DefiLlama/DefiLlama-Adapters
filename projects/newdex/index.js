const axios = require("axios");
const retry = require('../helper/retry')
const { get_currency_balance } = require("../helper/eos");

async function simple_price(ids) {
  const response = await retry(async () => await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`));
  return response.data;
}

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

async function get_account_tvl(account) {
  let tvl = 0;
  const price_feed = await simple_price(tokens.map(row => row[2]).join(","));
  for ( const [ code, symbol, id ] of tokens ) {
    const balance = await get_currency_balance(code, account, symbol);
    tvl += balance * price_feed[id].usd;
  }
  return tvl;
}

// https://newdex.io
// NewDex limit orderbook
async function eos() {
  return await get_account_tvl("newdexpublic");
}

async function fetch() {
  return await eos();
}

module.exports = {
  methodology: `NewDex TVL is achieved by querying token balances from NewDex's limit orderbook smart contract.`,
  eos: {
    fetch: eos
  },
  fetch
}
