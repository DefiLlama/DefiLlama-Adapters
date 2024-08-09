const axios = require("axios");

async function getConfig(url) {
  const { data: json } = await axios.get(url);
  return json;
}

module.exports = {
  getConfig,
};
