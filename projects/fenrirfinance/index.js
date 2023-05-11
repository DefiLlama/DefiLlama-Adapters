const {fullCoumpoundExports} = require('../helper/compound');

const replace = {
  "0x250632378e573c6be1ac2f97fcdf00515d0aa91b": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // beth->weth
  "0xfb6115445bff7b52feb98650c87f44907e58f802": "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", // aave
}

module.exports = fullCoumpoundExports("0x56b4B49f31517be8DacC2ED471BCc20508A0e29D", "bsc", "0x444ADC2D487090A660ebFdDd934d0E962410d8Cc", "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", addr=>{
  return replace[addr.toLowerCase()] || `bsc:${addr}`
})
