// documentation: https://developer.algorand.org/docs/get-details/indexer/?from_query=curl#sdk-client-instantiations

const axios = require('axios')
const { getApplicationAddress } = require('./algorandUtils/address')
const { RateLimiter } = require("limiter");

const axiosObj = axios.create({
  baseURL: 'https://algoindexer.algoexplorerapi.io',
  timeout: 300000,
})

const indexerLimiter = new RateLimiter({ tokensPerInterval: 10, interval: "second" });

async function lookupApplications(appId) {
  return (await axiosObj.get(`/v2/applications/${appId}`)).data
}

async function lookupAccountByID(appId) {
  return (await axiosObj.get(`/v2/accounts/${appId}`)).data
}

async function searchAccounts({ appId, limit = 1000, nexttoken, }) {
  const response = (await axiosObj.get('/v2/accounts', {
    params: {
      'application-id': appId,
      limit,
      next: nexttoken
    }
  }))
  return response.data
}

const withLimiter = (fn, tokensToRemove = 1) => async (...args) => {
  await indexerLimiter.removeTokens(tokensToRemove);
  return fn(...args);
}

module.exports = {
  getApplicationAddress,
  lookupApplications: withLimiter(lookupApplications),
  lookupAccountByID: withLimiter(lookupAccountByID),
  searchAccounts: withLimiter(searchAccounts),
}
