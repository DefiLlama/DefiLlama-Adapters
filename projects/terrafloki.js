const retry = require("./helper/retry");
const axios = require("axios");

async function fetch() {
    var res = await retry(
        async () => await axios.get("https://api.terrafloki.io/defi-llama/tvl")
    );

    return parseFloat(res.data);
}

module.exports = {
    fetch,
}; 
