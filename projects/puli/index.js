const PULI_TOKEN_CONTRACT = '0xaef0a177c8c329cbc8508292bb7e06c00786bbfc';
const { sumTokensExport, nullAddress, } = require('../helper/unknownTokens')
// const PULI_TOKEN_STAKING_CONTRACT = '0x864d434308997e9648838d23f3eedf5d0fd17bea';
const chain = 'bsc'
const TREASURY1 = '0xc569C21b0862B112Ed69bA9d2C6e9Ed86A036f9C'
const TREASURY2 = '0xA017862ADba59aA030b8aA0433eD91D9d909B8B1'

async function tvl(timestamp, block, chainBlocks) {
  return {}
}

module.exports = {
  bsc: {
    tvl,
    treasury: sumTokensExport({
      chain,
      tokensAndOwners: [
        [nullAddress, TREASURY1],
        [nullAddress, TREASURY2],
        ['0xe9e7cea3dedca5984780bafc599bd69add087d56', TREASURY1],
        ['0xC17c30e98541188614dF99239cABD40280810cA3', TREASURY1],
        ['0x3FF5cbE338153063D8251d2B6a22A437EC09Eef3', TREASURY2],
      ],
    })
  }
}
