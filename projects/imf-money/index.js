const { sumTokensExport } = require('../helper/unwrapLPs')
const PEPE_TOKEN_CONTRACT = '0x6982508145454Ce325dDbE47a25d4ec3d2311933';
const MOG_TOKEN_CONTRACT = '0xaaee1a9723aadb7afa2810263653a34ba2c21c7a';
const LOCKED_MONEY_CONTRACT = '0x30F75834cB406b7093208Fda7F689938aCBD1EeB'; //wallet that has all the locked money

module.exports = {
  methodology: 'Sums the value of deposited memes',
  ethereum: {
    tvl: sumTokensExport({ owner: LOCKED_MONEY_CONTRACT, tokens: [PEPE_TOKEN_CONTRACT,MOG_TOKEN_CONTRACT]}),
  }
}; 
