const axios = require("axios");
const retry = require("async-retry");

async function getPlatformData() {
  const response = await retry(async (_) =>
    axios.get("https://55vvs1ddm4.execute-api.eu-central-1.amazonaws.com/default/tvl")
  );
  return response.data;
}

async function fetch() {
  return (await getPlatformData()).general.tvl;
}

module.exports = {
  methodology: 'TVL counts the tokens deposited to all vaults',
  fetch
};

fetch()