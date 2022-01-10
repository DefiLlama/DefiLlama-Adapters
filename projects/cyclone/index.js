const { axios } = require("axios");

async function fetch() {
  const result = await axios.get("https://cyclone.xyz/api/tvl");

  return result.data.tvl;
}

module.exports = {
  tvl: fetch,
};
