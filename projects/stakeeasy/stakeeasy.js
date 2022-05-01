const retry = require('../helper/retry')
const axios = require("axios");

async function fetch() {
  var response = await retry(async bail => await axios.get('https://arufaresearch.pythonanywhere.com/tvl'))

  return response.tvl;
}

module.exports = {
  methodology: "TVL is the total amount SCRT deposited to the staking contract. It is calculatd by checking our contract balance.",
  fetch
}