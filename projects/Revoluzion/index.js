const sdk = require("@defillama/sdk")
const { sumTokensExport, nullAddress, } = require('../helper/unknownTokens')
const chain = 'bsc'
const REVOLUZION_TOKEN_CONTRACT = '0x7D89c67d3c4E72E8c5c64BE201dC225F99d16aCa';
const REVOLUZION_DIAMOND_HAND_CONTRACT = '0xA72a15369Fe9840a20c40F18b1695eF168fFFa77';
const REVOLUZION_DIVIDEND_CONTRACT = '0x23259212B5CD09A511440b9DD472d339C716dEb5';

async function tvl(timestamp, block, chainBlocks) {
  return {}
}

module.exports = {
  bsc: {
    tvl,
    treasury: sumTokensExport({
      chain,
      tokensAndOwners: [
        [nullAddress, REVOLUZION_TOKEN_CONTRACT],
        [nullAddress, REVOLUZION_DIAMOND_HAND_CONTRACT],
        [nullAddress, REVOLUZION_DIVIDEND_CONTRACT],
        ['0x7D89c67d3c4E72E8c5c64BE201dC225F99d16aCa', REVOLUZION_TOKEN_CONTRACT],
        ['0xA72a15369Fe9840a20c40F18b1695eF168fFFa77', REVOLUZION_DIAMOND_HAND_CONTRACT],
        ['0x23259212B5CD09A511440b9DD472d339C716dEb5', REVOLUZION_DIVIDEND_CONTRACT],
      ],
    })
  }
}
