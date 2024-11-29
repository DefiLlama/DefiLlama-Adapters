const { sumTokensExport } = require('../helper/unwrapLPs')
const depositBoxETH = '0x49F583d263e4Ef938b9E09772D3394c71605Df94';
const depositBoxERC20 = '0x8fB1A35bB6fB9c47Fb5065BE5062cB8dC1687669';

module.exports = {
  start: '2021-07-19', // Mon July 19 06:38:20 PM UTC 2021
  ethereum: {
    tvl: sumTokensExport({ owners: [depositBoxETH, depositBoxERC20], fetchCoValentTokens: true, permitFailure: true }),
  }
}