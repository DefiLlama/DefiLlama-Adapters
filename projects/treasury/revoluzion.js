const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unknownTokens')
const REVOLUZION_TOKEN_CONTRACT = '0x7D89c67d3c4E72E8c5c64BE201dC225F99d16aCa';
const REVOLUZION_DIAMOND_HAND_CONTRACT = '0xA72a15369Fe9840a20c40F18b1695eF168fFFa77';
const REVOLUZION_DIVIDEND_CONTRACT = '0x23259212B5CD09A511440b9DD472d339C716dEb5';
const BUSD = ADDRESSES.bsc.BUSD

module.exports = {
  bsc: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [BUSD, REVOLUZION_DIAMOND_HAND_CONTRACT],
        [BUSD, REVOLUZION_DIVIDEND_CONTRACT],
      ],
    })
  }
}
