const axios = require("axios");

async function request(endpoint, query, { variables, withMetadata = false } = {}) {
  const { data: result } = await axios.post(endpoint, { query, variables })
  return withMetadata ? result : result.data
}

module.exports = { request }