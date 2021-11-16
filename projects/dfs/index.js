const axios = require("axios");
const retry = require('../helper/retry')
const { get_currency_balance } = require("../helper/eos");

async function simple_price(ids) {
  const response = await retry(async () => await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`));
  return response.data;
}

const tokens = [
  ["eosio.token", "EOS", "eos"],
  ["minedfstoken", "DFS", "defis-network"],
  ["btc.ptokens", "PBTC", "ptokens-btc"],
  ["tethertether", "USDT", "tether"],
  ["token.defi", "BOX", "defibox"],
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

// https://apps.defis.network/
// AMM swap
async function eos() {
  return await get_account_tvl("defisswapcnt");
}

async function fetch() {
  return await eos();
}

module.exports = {
  methodology: `DFS TVL is achieved by querying token balances from DFS's AMM swap liquidity smart contract.`,
  eos: {
    fetch: eos
  },
  fetch
}
