const {fullCoumpoundExports} = require('./helper/compound');

const replace = {
  "0x250632378e573c6be1ac2f97fcdf00515d0aa91b": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // beth->weth
  "0xfb6115445bff7b52feb98650c87f44907e58f802": "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", // aave
}

module.exports = fullCoumpoundExports("0xfd36e2c2a6789db23113685031d7f16329158384", "bsc", "0xA07c5b74C9B40447a954e1466938b865b6BBea36", "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", addr=>{
  return replace[addr.toLowerCase()] || `bsc:${addr}`
})
