const ADDRESSES = require('./helper/coreAssets.json')
const {fullCoumpoundExports} = require('./helper/compound');

const replace = {
  [ADDRESSES.bsc.BETH]: ADDRESSES.ethereum.WETH, // beth->weth
  "0xfb6115445bff7b52feb98650c87f44907e58f802": ADDRESSES.ethereum.AAVE, // aave
}

module.exports = fullCoumpoundExports("0xfd36e2c2a6789db23113685031d7f16329158384", "bsc", "0xA07c5b74C9B40447a954e1466938b865b6BBea36", ADDRESSES.bsc.WBNB, addr=>{
  return replace[addr.toLowerCase()] || `bsc:${addr}`
})
