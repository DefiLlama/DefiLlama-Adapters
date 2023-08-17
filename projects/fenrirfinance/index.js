const ADDRESSES = require('../helper/coreAssets.json')
const {fullCoumpoundExports} = require('../helper/compound');

const replace = {
  [ADDRESSES.bsc.BETH]: ADDRESSES.ethereum.WETH, // beth->weth
  "0xfb6115445bff7b52feb98650c87f44907e58f802": ADDRESSES.ethereum.AAVE, // aave
}

module.exports = fullCoumpoundExports("0x56b4B49f31517be8DacC2ED471BCc20508A0e29D", "bsc", "0x444ADC2D487090A660ebFdDd934d0E962410d8Cc", ADDRESSES.bsc.WBNB, addr=>{
  return replace[addr.toLowerCase()] || `bsc:${addr}`
})
