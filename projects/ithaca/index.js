const { sumTokensExport } = require("../helper/unwrapLPs");

const ITHACA_FUNDLOCK_CONTRACT = '0x4a20d341315b8ead4e5ebecc65d95080a47a7316';
const WETH_CONTRACT = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
const USDC_CONTRACT = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of WETH and USDC in Ithaca Fundlock contract',
  start: 176036233,
  arbitrum: {
    tvl: sumTokensExport({ 
      owner: ITHACA_FUNDLOCK_CONTRACT, 
      tokens: [ WETH_CONTRACT, USDC_CONTRACT ],
    }),
  }
}; 