const axios = require('axios');
const sdk = require('@defillama/sdk')
const { DEFAULT_TIMEOUT } = require('../http')

const endpoint = 'https://mainnet.aeternity.io/v2/accounts'; // Replace with the appropriate endpoint

async function getBalance(address) {
  try {
    const response = await axios.get(`${endpoint}/${address}`, { timeout: DEFAULT_TIMEOUT });
    const balance = response.data.balance;
    return balance;
  } catch (error) {
    if (error.response?.status === 404) return 0;
    throw error;
  }
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0;
  for (const owner of owners) {
    const balance = await getBalance(owner);
    total += balance;
  }
  sdk.util.sumSingleBalance(balances, 'aeternity', total);
  return balances;
}

module.exports = {
  sumTokens
};