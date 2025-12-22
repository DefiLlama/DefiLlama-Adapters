const ADDRESSES = require('../helper/coreAssets.json')


// https://docs.alphasec.trade/for-developers/contract-addresses
async function tvl(api) {
  return api.sumTokens({
    owners: ['0x483a9ed25747711f38778a69d4d99b7e5365e506', '0xf31ce581a8440f0f4850edeb343a28372572a088', ],
    tokens: [ADDRESSES.klaytn.USDT_1, ADDRESSES.klaytn.WETH, ADDRESSES.klaytn.BORA],
  })
}


module.exports = {
  klaytn: {
    tvl,
  }
}