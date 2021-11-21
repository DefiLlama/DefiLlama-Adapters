//https://xdc.blocksscan.io/api/accounts/xdc0000000000000000000000000000000000000088
//npm install axios@0.21.1

// Date/Time  headers/date
// TVL        data/balanceNumber
// Block

const axios = require('axios');

async function tvl(price) {
  try {
    const response = await axios.get('https://xdc.blocksscan.io/api/accounts/xdc0000000000000000000000000000000000000088');
    var logString = ("{Total TVL: "+response.data.balanceNumber*price+ ", Timestamp: " +response.headers.date+ "}")
    console.log(logString);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  tvl
  }
  
//tvl(1)