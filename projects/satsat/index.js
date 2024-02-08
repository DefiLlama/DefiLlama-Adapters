const sdk = require("@defillama/sdk");
const axios = require('axios')

const BigNumber = require("bignumber.js");
const HOST=''
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
  methodology: "Get the amount of tokens in satsat platform",
  map: {
    tvl: request_tvl
  }
};
