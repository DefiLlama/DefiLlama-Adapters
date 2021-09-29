const axios = require("axios");

const EOSFLARE_ENDPOINT = "https://api.eosflare.io";

async function get_account_tvl(account) {
  const response = await axios.default.post(EOSFLARE_ENDPOINT + "/v1/eosflare/get_account", {account});
  const { token_value, balance_total, eos_price } = response.data.account;
  return token_value + // sum of all alt tokens
         balance_total * eos_price; // sum of EOS balance * price
}

// https://newdex.io
// NewDex limit orderbook
async function eos() {
  return await get_account_tvl("newdexpublic");
}

// https://bsc.newdex.io
// project active on BSC, however no TVL
async function bsc() {
  return 0; // TODO FIX
}

async function fetch() {
  return await eos() + await bsc();
}

module.exports = {
  methodology: `NewDex TVL is achieved by querying token balances from NewDex's limit orderbook smart contract via https://eosflare.io/api.`,
  eos: {
    fetch: eos
  },
  fetch
}
