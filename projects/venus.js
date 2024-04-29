const ADDRESSES = require('./helper/coreAssets.json')
const {fullCoumpoundExports, compoundExports2} = require('./helper/compound');

const replace = {
  [ADDRESSES.bsc.BETH]: ADDRESSES.ethereum.WETH, // beth->weth
  "0xfb6115445bff7b52feb98650c87f44907e58f802": ADDRESSES.ethereum.AAVE, // aave
}

module.exports = fullCoumpoundExports("0xfd36e2c2a6789db23113685031d7f16329158384", "bsc", "0xA07c5b74C9B40447a954e1466938b865b6BBea36", ADDRESSES.bsc.WBNB, addr=>{
  return replace[addr.toLowerCase()] || `bsc:${addr}`
})

module.exports.ethereum = compoundExports2({ comptroller: '0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796'})
module.exports.op_bnb = compoundExports2({ comptroller: '0xd6e3e2a1d8d95cae355d15b3b9f8e5c2511874dd'})