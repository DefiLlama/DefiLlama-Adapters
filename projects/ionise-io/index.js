const ADDRESSES = require('../helper/coreAssets.json')
const {compoundExports2} = require('../helper/compound');

const replace = {
  [ADDRESSES.bsc.BETH]: ADDRESSES.ethereum.WETH, // beth->weth
  "0xfb6115445bff7b52feb98650c87f44907e58f802": ADDRESSES.ethereum.AAVE, // aave
}

module.exports = {
  zilliqa: compoundExports2({ comptroller: '0x5F8B5312636Af3bA626C12327a5d8EE4301A65F8', cether: '0x9386c982fcb1aecbd949d04143d8a9e32b4b52bb'})
}