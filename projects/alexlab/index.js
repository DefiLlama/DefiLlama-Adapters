const axios = require("axios");
const retry = require("../helper/retry");

// https://explorer.stacks.co/txid/SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-vault?chain=mainnet
// https://stacks-node-api.blockstack.org/extended/v1/address/SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-vault/balances
const ALEX_API = "https://api.alexlab.co/v1";

async function fetch() {
  const url = `${ALEX_API}/pool_token_stats`;
  const alexStatsResponse = (await retry(async () => await axios.get(url)))
    .data;

  const valueLockedMap = {};
  let totalValueLocked = 0;
  for (const pool of alexStatsResponse) {
    let poolValue = 0;
    const poolToken = pool.pool_token;

    if (poolToken == "age000-governance-token") {
      poolValue = pool.price * pool.reserved_balance;
    } else {
      poolValue = pool.price * pool.total_supply;
    }
    totalValueLocked += poolValue;
    valueLockedMap[poolToken] = poolValue;
  }

  return totalValueLocked;
}

async function staking() {
  const url = `${ALEX_API}/stats/tvl`;
  const alexResponse = (await retry(async () => await axios.get(url))).data;
  return alexResponse.reserve_pool_value;
}

// node test.js projects/alexlab/index.js
module.exports = {
  timetravel: false,
  stacks: {
    fetch,
  },
  staking: { fetch: staking },
  fetch,
  methodology: "Alex Lab TVL is sum of tokens locked in ALEX platform.",
};
