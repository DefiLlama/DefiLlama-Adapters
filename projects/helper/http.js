const retry = require('./retry')
const axios = require("axios")
const { request } = require("graphql-request")

async function get(endpoint) {
  return (await retry(async _ => await axios.get(endpoint))).data
}

async function graphQuery(endpoint, graphQuery, params = {}) {
  return request(endpoint, graphQuery, params)
}

module.exports = {
  get,
  graphQuery,
}