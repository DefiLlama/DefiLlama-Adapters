const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  ADDRESS_ZERO: ADDRESSES.null,
  EXPIRATION_START_FROM: 1605000000,
  NETWORK_MAINNET: {
    id: 1,
    name: 'ethereum',
    vaults: [
      '0xbab1e772d70300422312dff12daddcb60864bd41',
      '0x463F9ED5e11764Eb9029762011a03643603aD879',
      '0x5FE4B38520e856921978715C8579D2D7a4d2274F',
      '0x287f941aB4B5AaDaD2F13F9363fcEC8Ee312a969'
    ]
  },
  ABI_SHORT: {
    asset: 'address:asset'
  }
}
