const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const axios = require("axios");
const retry = require("../helper/retry");

// https://explorer.stacks.co/txid/SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-vault?chain=mainnet
// https://stacks-node-api.blockstack.org/extended/v1/address/SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-vault/balances
const ALEX_API = "https://api.alexlab.co/v1";
const transformAddress = (addr) => {
  const slug = addr.substr(addr.indexOf("::") + 2);
  return slug;
};
async function tvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};

  // Retrieve contract balances using the blockstacks hiro REST API
  const url = `${ALEX_API}/stats/tvl`;
  const alexResponse = await retry(async () => await axios.get(url));
  const total_tvl = alexResponse.tvl;
  return total_tvl;
}

module.exports = {
  timetravel: false,
  stacks: {
    tvl,
  },
  methodology:
    "Alex Lab TVL is made of the vault token balances. The tokens balances are retrieved using Stacks HTTP REST API.",
};
