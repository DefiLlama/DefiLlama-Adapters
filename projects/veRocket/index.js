const { get } = require('../helper/http')

const baseUrl = "https://api-v1.verocket.com";
const tvlApy = `${baseUrl}/dex/overall/lp_volume`

async function tvl() {
  const response = (await get(tvlApy)).data;
  return {
    'vechain': +response[response.length - 1].eq_vet
  }
}

module.exports = {
  timetravel: false,
  vechain: {
    tvl
  }
}
