const axios = require("axios");

const api = "https://api.uxd.fi/api/uxd-circulating-supply";

async function fetch() {
    const result = (await axios.get(api)).data;
    return result;
}

module.exports = {
    fetch
}