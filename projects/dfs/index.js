const axios = require("axios");

const EOSFLARE_ENDPOINT = "https://api.eosflare.io";

async function get_account_tvl(account) {
  const response = await axios.default.post(EOSFLARE_ENDPOINT + "/v1/eosflare/get_account", {account});
  const { balance_total, eos_price } = response.data.account;
  return balance_total * eos_price; // sum of EOS balance * price
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
  methodology: `DFS TVL is achieved by querying token balances from DFS's AMM swap liquidity smart contract via https://eosflare.io/api.`,
  eos: {
    fetch: eos
  },
  fetch
}
