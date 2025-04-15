const { sumTokensExport } = require('../helper/unwrapLPs')
const MOG_TOKEN_CONTRACT = '0xaaee1a9723aadb7afa2810263653a34ba2c21c7a';
const MORPHO_BLUE_CONTRACT = '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb'; //Morpho Blue wallet address where deposited memes are stored. 

module.exports = {
  methodology: 'Sums the value of deposited memes in the Morpho Pool',
  ethereum: {
    tvl: sumTokensExport({ owner: MORPHO_BLUE_CONTRACT, tokens: [MOG_TOKEN_CONTRACT]}),
  }
}; 
