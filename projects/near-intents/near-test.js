const axios = require("axios")
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require("bignumber.js")
  // Define success codes
const successCodes = [200, 201, 202, 204];
  
  // Error formatter function
function formAxiosError(url, error, { method }) {
    return new Error(`HTTP ${method} request to ${url} failed: ${error.message}`);
}
  
  // The httpGet function
async function httpGet(url, options, { withMetadata = false } = {}) {
    try {
        const res = await axios.get(url, options);
        if (!successCodes.includes(res.status)) throw new Error(`Error fetching ${url}: ${res.status} ${res.statusText}`);
        if (!res.data) throw new Error(`Error fetching ${url}: no data`);
        if (withMetadata) return res;
        return res.data;
    } catch (error) {
        throw formAxiosError(url, error, { method: 'GET' });
    }
}

function sumSingleBalance(balances, token, balance) {
  const { name, decimals, } = {}

  if (name) {
    if (decimals)
      balance = balance / (10 ** decimals)

    balances[name] = +(balances[name] || 0) + balance
    return
  }

  sdk.util.sumSingleBalance(balances, token, BigNumber(balance).toFixed(0))
  return balances
}

function tvl() {
    return async () => {
        const balances = {};

        const api_tvl = "https://flipsidecrypto.xyz/api/v1/queries/912162c9-22f1-46d9-88a1-1059b8f0b6b3/data/latest";
        const assetsCallResponse = await httpGet(api_tvl);

        // Process each item in the response
        assetsCallResponse.forEach((item) => {
            const token = item.SYMBOL;
            const balance = item.NET_TOKENS_MINTED_USD || 0;
            sumSingleBalance(balances, token, balance);
        });

        return balances;
    }
}
  
  // Test the function
async function testHttpGet() {
    try {
        // Test with a public API endpoint
        const url = 'https://flipsidecrypto.xyz/api/v1/queries/912162c9-22f1-46d9-88a1-1059b8f0b6b3/data/latest';
        
        console.log('\nTesting without metadata:');
        const tvlFunction = tvl();
        const responseData = await tvlFunction();
        console.log('Response data:', responseData);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
  
  // Run the test
testHttpGet();