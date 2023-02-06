const { get } = require('./helper/http')
const BigNumber = require("bignumber.js");
const url = 'https://europe-west3-wormhole-315720.cloudfunctions.net/mainnet-notionaltvl'
let _response

function fetch(chainId) {
  return async () => {
    if (!_response) _response = get(url)
    const res = await _response
    if (chainId in res.AllTime) {
      const tvl = res.AllTime[chainId]["*"].Notional
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
  aptos: {
    fetch: fetch("22")
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
  algorand: {
    fetch: fetch("8")
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
  acala: {
    fetch: fetch("12") 
  },
  klaytn: {
    fetch: fetch("13")
  },
  celo: {
    fetch: fetch("14")
  },
  near: {
    fetch: fetch("15")
  },
  moonbeam: {
    fetch: fetch("16")
  },
  terra2: {
    fetch: fetch("18")
  },
  fetch: fetch("*"),
  hallmarks:[
    [1652008803, "UST depeg"],
    [Math.floor(new Date('2022-02-02')/1e3), 'Hacked: Signature Exploit'],
  ],
}
