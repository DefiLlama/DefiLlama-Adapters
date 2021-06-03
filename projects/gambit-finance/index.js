const sdk = require("@defillama/sdk");
const axios = require('axios')
const BigNumber = require("bignumber.js");

const apiEndpoint = 'https://gambit-server-staging.uc.r.appspot.com/tokens'
async function tvl(timestamp, block) {
    const balances = {}
    const allTokens = (await axios.get(apiEndpoint)).data
    allTokens.map(function (token) {
        balances['bsc:'+token.id] = new BigNumber(token.data.poolAmount)
     }
    )
    return balances
}

module.exports = {
    name: "Gambit",
    token: "GMT",
    category: "DEXes",
    bsc: {
        tvl
    },
    tvl
};
