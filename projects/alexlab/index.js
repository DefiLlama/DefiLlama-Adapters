const axios = require("axios");
const retry = require("../helper/retry");

// https://explorer.stacks.co/txid/SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-vault?chain=mainnet
// https://stacks-node-api.blockstack.org/extended/v1/address/SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-vault/balances
const ALEX_API = "https://api.alexlab.co/v1";

async function fetch() {
  const url = `${ALEX_API}/stats/tvl`;
  const alexResponse = (await retry(async () => await axios.get(url))).data;
  return alexResponse.lp_token_supply;
}
// node test.js projects/alexlab/index.js
module.exports = {
  timetravel: false,
  stacks: {
    fetch
  },
  fetch,
  methodology: "Alex Lab TVL is sum of tokens locked in ALEX platform."
};
