const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const ITHACA_FUNDLOCK_CONTRACT = '0x4a20d341315b8ead4e5ebecc65d95080a47a7316';
const WETH_CONTRACT = ADDRESSES.arbitrum.WETH;
const USDC_CONTRACT = ADDRESSES.arbitrum.USDC_CIRCLE;
const ITHACA_WETH_AAVE_STRATEGY_CONTRACT = '0x0916ef55d869d96b2Bab778bFcE15305312c61fc'
const ITHACA_USDC_AAVE_STRATEGY_CONTRACT = '0x7071da72BCCd7dd8AE63C0cF3ea606D8cBb1D8dA'
const AWETH_CONTRACT = '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8'
const AUSDC_CONTRACT = '0x724dc807b04555b71ed48a6896b6F41593b8C637'

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of WETH and USDC in Ithaca Fundlock contract',
  arbitrum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [WETH_CONTRACT, ITHACA_FUNDLOCK_CONTRACT],
        [USDC_CONTRACT, ITHACA_FUNDLOCK_CONTRACT],
        [AWETH_CONTRACT, ITHACA_WETH_AAVE_STRATEGY_CONTRACT],
        [AUSDC_CONTRACT, ITHACA_USDC_AAVE_STRATEGY_CONTRACT],
      ],
    }),
  }
}; 
