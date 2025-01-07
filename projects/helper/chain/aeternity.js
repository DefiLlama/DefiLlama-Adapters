const axios = require('axios');
const sdk = require('@defillama/sdk')

const endpoint = 'https://mainnet.aeternity.io/v2/accounts'; // Replace with the appropriate endpoint

async function getBalance(address) {
  try {
    const response = await axios.get(`${endpoint}/${address}`);
    const balance = response.data.balance;
    return balance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
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