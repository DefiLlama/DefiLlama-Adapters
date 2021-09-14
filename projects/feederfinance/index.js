const axios = require("axios");
const retry = require("async-retry");

async function getPlatformData() {
  const response = await retry(async (_) =>
    axios.get("https://api.feeder.finance/v1/platform")
  );
  return response.data;
}

async function staking() {
  return (await getPlatformData()).stakeTvlUsd;
}

async function pool2() {
  return (await getPlatformData()).farmTvlUsd;
}

async function fetch() {
  return (await getPlatformData()).autoStakingTvlUsd;
}

module.exports = {
  methodology: 'TVL counts the tokens deposited to the Autostaking strategy, Pool2 counts the deposits made to FEED farming and staking sums the deposits made to FEED staking.',
  bsc: {
    fetch,
  },
  fetch,
  pool2:{
    fetch: pool2
  },
  staking:{
    fetch: staking
  },
};