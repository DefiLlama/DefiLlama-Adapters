// Documentation and source code for API "get-tvl" method: github.com/defibasket/defibasket-api

const axios = require("axios");

async function fetch() {
    const tvl = await axios.get("https://defibasket.org/api/v1/get-tvl");    
    return tvl.data.tvl;
}

module.exports = {
  methodology: "The TVL is calculated by summing the value of all assets that are in the wallets deployed by the DeFiBasket contract.",
  fetch,
}