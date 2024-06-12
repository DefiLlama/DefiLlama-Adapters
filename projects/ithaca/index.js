const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const ITHACA_FUNDLOCK_CONTRACT = '0x4a20d341315b8ead4e5ebecc65d95080a47a7316';
const WETH_CONTRACT = ADDRESSES.arbitrum.WETH;
const USDC_CONTRACT = ADDRESSES.arbitrum.USDC_CIRCLE;

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