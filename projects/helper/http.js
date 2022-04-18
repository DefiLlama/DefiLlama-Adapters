const retry = require('./retry')
const axios = require("axios")
const { request } = require("graphql-request")

async function get(endpoint) {
  return (await retry(async _ => await axios.get(endpoint))).data
}

async function post(endpoint, body) {
  return (await axios.post(endpoint, body)).data
}

async function graphQuery(endpoint, graphQuery, params = {}) {
  return request(endpoint, graphQuery, params)
}

module.exports = {
  get,
  post,
  graphQuery,
}