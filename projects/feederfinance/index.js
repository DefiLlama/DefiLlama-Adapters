const axios = require("axios");
const retry = require("async-retry");
const { toUSDTBalances } = require("../helper/balances");

async function getPlatformData() {
  const response = await retry(async (_) =>
    axios.get("https://api.feeder.finance/v1/tvl")
  );
  return response.data;
}

async function staking() {
  return toUSDTBalances((await getPlatformData()).stakeTvlUsd);
}

async function pool2() {
  return toUSDTBalances((await getPlatformData()).farmTvlUsd);
}

async function bscTvl() {
  return toUSDTBalances((await getPlatformData()).bscVaultTvlUsd);
}

async function fantomTvl() {
  return toUSDTBalances((await getPlatformData()).fantomVaultTvlUsd);
}

async function tvl() {
  return toUSDTBalances((await getPlatformData()).totalVaultTvlUsd);
}

module.exports = {
  methodology:
    "All data is pulled from feeder's API. TVL counts the tokens deposited to the Vault strategies, Pool2 counts the deposits made to FEED farming and staking sums the deposits made to FEED staking.",
  misrepresentedTokens: true,
  bsc: {
    tvl:bscTvl,
    pool2,
    staking,
  },
  fantom: {
    tvl:fantomTvl,
  },
};
