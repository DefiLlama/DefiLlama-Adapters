const axios = require("axios");
const sdk = require('@defillama/sdk')

async function getAdaInAddress(address) {
  return axios.post("https://api.koios.rest/api/v0/address_info", {
    "_addresses": [
      address
    ]
  }).then(r => r.data[0].balance / 1e6)
}

async function sumTokens({ owners, balances = {} }) {
  const { data } = await axios.post("https://api.koios.rest/api/v0/address_info", {
    "_addresses": owners
  })
  for (const { balance } of data)
    sdk.util.sumSingleBalance(balances, 'cardano', balance / 1e6)
  return balances
}

module.exports = {
  getAdaInAddress,
  sumTokens,
}