const axios = require("axios");

async function request(endpoint, query, { variables, withMetadata = false } = {}) {
  const { data: result } = await axios.post(endpoint, { query, variables })
  if (result.errors) throw new Error(result.errors[0].message)
  return withMetadata ? result : result.data
}

module.exports = { request }