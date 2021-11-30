const axios = require("axios");

const tvlUrl = "https://bananafarm.io/api/boba/tvl";

const fetch = async () => {
  const { data } = await axios.get(tvlUrl) || {};
  return data?.tvl || 0;
};

module.exports = {
  name: "Banana",
  token: "BANA",
  start: 1638237600,
  boba: {
    fetch
  },
  fetch
};
