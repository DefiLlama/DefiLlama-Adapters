const { post } = require("../http");

async function request(endpoint, query, { variables, withMetadata = false, headers } = {}) {
  const result = await post(endpoint, { query, variables }, { headers })
  if (result.errors) throw new Error(result.errors[0].message)
  return withMetadata ? result : result.data
}

module.exports = { request }