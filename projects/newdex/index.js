const axios = require("axios");

const EOSFLARE_ENDPOINT = "https://api.eosflare.io";

async function get_account_tvl(account) {
  const response = await axios.default.post(EOSFLARE_ENDPOINT + "/v1/eosflare/get_account", {account});
  const { token_value, balance_total, eos_price } = response.data.account;
  return token_value + // sum of all alt tokens
         balance_total * eos_price; // sum of EOS balance * price
}

async function eos() {
  return await get_account_tvl("newdexpublic");
}

async function fetch() {
  return await eos()
}

module.exports = {
  methodology: `NewDex TVL is achieved by querying token balances from NewDex smart contract via https://eosflare.io/api.`,
  name: 'NewDex',
  token: 'DEX',
  category: 'dexes',
  eos: {
    fetch: eos
  },
  fetch
}
