const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require('../helper/unknownTokens')
// const PULI_TOKEN_STAKING_CONTRACT = '0x864d434308997e9648838d23f3eedf5d0fd17bea';
const chain = 'bsc'
const TREASURY1 = '0xc569C21b0862B112Ed69bA9d2C6e9Ed86A036f9C'
const TREASURY2 = '0xA017862ADba59aA030b8aA0433eD91D9d909B8B1'

module.exports = {
  bsc: {
    tvl: sumTokensExport({
      chain,
      tokensAndOwners: [
        [nullAddress, TREASURY1],
        [nullAddress, TREASURY2],
        [ADDRESSES.bsc.BUSD, TREASURY1],
        ['0xC17c30e98541188614dF99239cABD40280810cA3', TREASURY1],
        [ADDRESSES.bsc.USDT, TREASURY1],
        ['0x3FF5cbE338153063D8251d2B6a22A437EC09Eef3', TREASURY1],
        ['0x3FF5cbE338153063D8251d2B6a22A437EC09Eef3', TREASURY2],
        [ADDRESSES.bsc.BUSD, TREASURY2],
        ['0xC17c30e98541188614dF99239cABD40280810cA3', TREASURY2],
        [ADDRESSES.bsc.USDT, TREASURY2],
      ],
    })
  }
}
