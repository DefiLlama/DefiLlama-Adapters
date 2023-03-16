const { get } = require('../helper/http')

async function fetch() {
  const response = await get('https://api.everlend.finance/api/v1/info')

  return response.tvl;
}

module.exports = {
  timetravel: false,
  solana: {
    fetch
  },
  fetch,
};
