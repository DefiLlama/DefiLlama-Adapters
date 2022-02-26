const axios = require('axios');
const {getTokenSupply} = require('../helper/solana');

async function soliRate() {
    return await axios.get("https://lima-api.amun.com/tokenRate/APygy51vntbQQsYmgkF1CeMsAn5Tv1rsVUB6nee3wJpY?chain=solana");
}

async function tvl(){
    const rate = await soliRate();
    const tokenSupply = await getTokenSupply("8JnNWJ46yfdq8sKgT1Lk4G7VWkAA8Rhh7LhqgJ6WY41G");
    
    return rate.data.value * tokenSupply;
}

module.exports = {
    timetravel: false,
    tvl,
}
