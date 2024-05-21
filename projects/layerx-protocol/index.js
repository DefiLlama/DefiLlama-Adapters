const { sumTokens2, } = require('../helper/unwrapLPs')

async function tvl(api) {
  
  return sumTokens2({ owners: [
    '0xB88bcdaF020D963aFB0ED203bc02dB00D1b106C5',
    '0x983b9d04e7F7De7E81E9520d878D9075657DE03B',
    '0x7887761179ff0c3AaB0CA7CC794F5BD5e60e1674',
    
  ], tokens: ['0x7887761179ff0c3AaB0CA7CC794F5BD5e60e1674'], api, }) //lslor
}

module.exports = {
  btr: { tvl, }
}
