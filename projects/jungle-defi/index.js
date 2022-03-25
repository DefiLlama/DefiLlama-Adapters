const solanaWeb3 = require('@solana/web3.js');
const axios = require('axios')

async function fetch() {
  let value = 0;
  const res = await axios.get('https://api.jungledefi.io/v1/treasury')
    .then(response => {
      value = response.data.data.tvl
    }).catch(console.error())
    return value
  };

  module.exports = {
    methodology: "TVL is calculated by computing the value of LP tokens and adding it to the value of the USDC in the treasury.",
    fetch
  };
