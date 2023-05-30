const { get } = require('../helper/http')
const MATRIX_API = "https://api.matrix.farm/statistics/tvl";
let _response

function fetch(key) {
  return async () => {
    if (!_response) _response = get(MATRIX_API)
    return (await _response)[key] 
  }
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "The TVL is calculated using a google cloud function that runs every minute, it checks the value of all the LPs staked in our vaults and returns the total",
  fantom: {
    fetch: fetch('fantom'),
  },
  optimism: {
    fetch: fetch('optimism'),
  },
  dogechain: {
    fetch: fetch('dogechain'),
  },
  arbitrum: {
    fetch: fetch('arbitrum'),
  },
  bsc: {
    fetch: fetch('binance'),
  },
  fetch: fetch('tvl')
}
