const { default: axios } = require("axios");

const api = "https://capitalfund-api-1-8ftn8.ondigitalocean.app/solanaFunds/details";

async function fetch() {
    let aumValue = (await axios.get(api)).data.totalVolume;
    return aumValue;
}

module.exports = {
    fetch
}
