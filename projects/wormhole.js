const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");
const url = 'https://europe-west3-wormhole-315720.cloudfunctions.net/mainnet-notionaltvl'
let _response

function fetch(chainId) {
  return async () => {
    if (!_response) _response = retry(async bail => await axios.get(url))
    const res = await _response
    if (chainId in res.data.AllTime) {
      const tvl = res.data.AllTime[chainId]["*"].Notional
      return new BigNumber(tvl).toFixed(2)
    } else {
      console.log('Chain no longer supported: %s', chainId)
      return BigNumber(0).toFixed(2)
    }
  }
}

module.exports = {
  methodology: "USD value of native assets currently held by Portal contracts. Token prices sourced from CoinGecko.",
  solana: {
    fetch: fetch("1")
  },
  ethereum: {
    fetch: fetch("2")
  },
  terra: {
    fetch: fetch("3")
  },
  bsc: {
    fetch: fetch("4")
  },
  polygon: {
    fetch: fetch("5")
  },
  avax: {
    fetch: fetch("6")
  },
  oasis: {
    fetch: fetch("7")
  },
  aurora: {
    fetch: fetch("9")
  },
  fantom: {
    fetch: fetch("10")
  },
  karura: {
    fetch: fetch("11")
  },
  celo: {
    fetch: fetch("14")
  },
  fetch: fetch("*")
}
