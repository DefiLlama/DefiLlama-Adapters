const axios = require('axios');

async function tvl(api) {
  const response = await axios.get('https://backend.prophet.fun/business-metrics/tvl?timestamp=' + api.timestamp);
  const data = response.data;

  api.add('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', data);
}


module.exports = {
  methodology: 'TVL is total quantity of USDC held in the predictions token accounts',
  start: 1753365600,
  solana: {
    tvl,
  }
}; 