const axios = require("axios");

async function tvlBSC() {
  const publicAPIKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnQiOiJzcGhyaS1mcm9udGVuZCIsIm9rIjp0cnVlLCJpYXQiOjE2NDQ5MjM3NzR9.aWsS3qwM2324szhEbOesc7EhStqp0jX22nBkQizPg-g"; //pub key
  const response = await axios.get(
    "https://app.spherium.finance/api/v1/amountLocked?network=BSC&includeMeta=true",
    {
      headers: {
        apikey: publicAPIKey,
      },
    }
  );

  return {
    spherium: response.data.metaData[0].numberOfTokens * 1,
  };
}
async function tvlETH() {
  const publicAPIKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnQiOiJzcGhyaS1mcm9udGVuZCIsIm9rIjp0cnVlLCJpYXQiOjE2NDQ5MjM3NzR9.aWsS3qwM2324szhEbOesc7EhStqp0jX22nBkQizPg-g"; //pub key
  const response = await axios.get(
    "https://app.spherium.finance/api/v1/amountLocked?network=ETH&includeMeta=true",
    {
      headers: {
        apikey: publicAPIKey,
      },
    }
  );

  return {
    spherium: response.data.metaData[0].numberOfTokens * 1,
  };
}

module.exports = {
  timetravel: false,

  methodology:
    "We call our API to get TVL for the tokens locked on our Bridges, both on BSC and ETH",
  bsc: {
    tvl: tvlBSC,
  },
  ethereum: {
    tvl: tvlETH,
  },
};
