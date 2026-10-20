const axios = require("axios");
const { DEFAULT_TIMEOUT } = require("../http");

async function request(endpoint, query, { variables, withMetadata = false, headers } = {}) {
  const { data: result } = await axios.post(endpoint, { query, variables }, { headers, timeout: DEFAULT_TIMEOUT })
  if (result.errors) throw new Error(result.errors[0].message)
  return withMetadata ? result : result.data
}

module.exports = { request }