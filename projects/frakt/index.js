const retry = require('async-retry')
const axios = require('axios');

async function tvl() {
  const { data } = await retry(async () => await axios.get('https://fraktion-monorep.herokuapp.com/stats/tvl'));

  return { solana: data.tvl ?? 0 };
}

module.exports = {
  timetravel: false,
  methodology: '',
  solana: {
    tvl,
  }
};
