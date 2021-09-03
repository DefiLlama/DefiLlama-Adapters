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
  bsc: {
    fetch,
    pool2,
    staking,
  },
  fetch,
  pool2,
  staking,
};