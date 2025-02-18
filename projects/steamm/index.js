const axios = require("axios");

async function tvl(api) {  
    const tvlResponse = await axios.get('https://api.suilend.fi/steamm/tvl')
    for (const coinType of Object.keys(tvlResponse.data)) {
        api.add(coinType, tvlResponse.data[coinType])
    }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl: tvl,
  },
}