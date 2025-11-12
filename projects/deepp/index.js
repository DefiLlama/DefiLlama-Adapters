const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

module.exports = {
  methodology: 'Lists the number of owned USDC tokens in the Deepp LP and BetLock contracts.',
  start: '2023-10-01',
  arbitrum: {
    tvl: sumTokensExport({
      owners: Object.values({
        BET_LP_CONTRACT: '0x84a512E120294C2017a88a8f1af2219Ec250CBaa',
        BET_BOX_ADDRESS: '0x05E1F51067a3Af2f9d0994a97779a78a2E26f921',
        BET_FEE_HANDLER_1_ADDRESS: '0x42e27a7D424C22ED3658970CAB01260f8C0EC5Bc',
        BET_FEE_HANDLER_2_ADDRESS: '0xD5750d44D9F2ed117FB3441D80B423acD7634Cf5',
        LP_FEE_HANDLER_1_ADDRESS: '0x80e674e6277A7e9073A6Dff5C98e08816c0D73f5',
        LP_FEE_HANDLER_2_ADDRESS: '0xAb5e18D29C20709954eA380e998FFFeaeB4FF691',
      }), tokens: [ADDRESSES.arbitrum.USDC_CIRCLE]
    }),
  }
}; // node test.js projects/deepp/index.js