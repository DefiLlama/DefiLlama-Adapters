const axios = require('axios')

const HOST='https://order.satsat.exchange'
const request_tvl = async () => {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${HOST}/defillama/tvl`,
  };
  let response =  await axios.request(config)
  console.log(response.data);
  let result = response.data.data;

  return { tether: result.totalAmount };
};

module.exports = {
  methodology: "Get the totalAmount of tokens in SatSat marketplace",
  map: {
    tvl: request_tvl
  }
};
