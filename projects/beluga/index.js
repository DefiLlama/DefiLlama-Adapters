const axios = require("axios");
const https = require("https");
let _data;

const agent = new https.Agent({
  rejectUnauthorized: false,
});

function fetch(chain) {
  return async () => {
    if (!_data)
      _data = await axios.get("http://api.beluga.fi/tvl", {
        httpsAgent: agent,
      });
    let data = _data.data;

    return {
      "usd-coin": data[chain],
    };
  };
}

module.exports = {
  timetravel: false,
  polygon: {
    tvl: fetch("Polygon"),
  },
  fantom: {
    tvl: fetch("Fantom"),
  },
};
