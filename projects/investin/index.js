const { default: axios } = require("axios");

const api = "https://capitalfund-api-1-8ftn8.ondigitalocean.app/solanaFunds/details";

async function tvl() {
    return (await axios.get(api)).data.totalVolume;
}

module.exports = {
    solana: {
        tvl
    }
}
