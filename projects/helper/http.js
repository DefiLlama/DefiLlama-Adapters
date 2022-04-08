const retry = require('./retry')
const axios = require("axios");

async function get(endpoint) {
  return (await retry(async _ => await axios.get(endpoint))).data
}

module.exports = {
  get
}