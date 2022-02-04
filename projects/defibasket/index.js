const axios = require("axios");

async function fetch() {
    const tvl = await axios.get("https://www.defibasket.org/api/get-tvl");    
    return tvl.data;
}

module.exports = {
  methodology: "The TVL is calculated by summing the value of all assets that are in the wallets deployed by the DeFiBasket contract. Its value is updated every 20 minutes.",
  fetch
}
