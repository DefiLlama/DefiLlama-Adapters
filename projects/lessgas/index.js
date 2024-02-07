const sdk = require("@defillama/sdk");
const axios = require('axios')

const BigNumber = require("bignumber.js");
const HOST='https://api2.lessgas.xyz'
// const HOST='http://127.0.0.1:9912'
const request_staking = async () => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${HOST}/llama/staking`,
  };
  let response =  await axios.request(config)
  console.log(response.data);
  let result = response.data.data;

  return { tether: new BigNumber(result.result).multipliedBy(new BigNumber(result.price)) };
};
const request_tvl = async () => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${HOST}/llama/tvl`,
  };
  let response =  await axios.request(config)
  console.log(response.data);
  let result = response.data.data;

  return { tether: new BigNumber(result.result).multipliedBy(new BigNumber(result.price)) };
};

module.exports = {
  methodology: "Get the amount of tokens in lessgas platform",
  map: {
    tvl: request_tvl,
    staking: request_staking
  }
};
