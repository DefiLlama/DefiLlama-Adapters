const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const ITHACA_FUNDLOCK_CONTRACT = '0x4a20d341315b8ead4e5ebecc65d95080a47a7316';
const WETH_CONTRACT = ADDRESSES.arbitrum.WETH;
const USDC_CONTRACT = ADDRESSES.arbitrum.USDC_CIRCLE;
const ITHACA_WETH_AAVE_STRATEGY_CONTRACT = '0xb2dd2f67132e2e5bc37cb2c1d3b193909b7fb26c'
const ITHACA_USDC_AAVE_STRATEGY_CONTRACT = '0x9f494058e0501498f09fd0173d5024e1d3a6fc57'
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