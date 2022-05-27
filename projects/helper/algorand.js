// documentation: https://developer.algorand.org/docs/get-details/indexer/?from_query=curl#sdk-client-instantiations

const axios = require('axios')
const { getApplicationAddress } = require('./algorandUtils/address')

const axiosObj = axios.create({
  baseURL: 'https://algoindexer.algoexplorerapi.io',
  timeout: 300000,
})

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



module.exports = {
  lookupApplications,
  lookupAccountByID,
  getApplicationAddress,
  searchAccounts,
}