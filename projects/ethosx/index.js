const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const ETH_PUT_CONTROLLER_ADDRESS = "0x55E008E3b0Aa6808Ca8B8Ba1DC319EC132554aCd";
const ETH_CALL_CONTROLLER_ADDRESS =
  "0x2eEFcBCa065bE1763be58276AFA41627A82dfa2D";
const BTC_PUT_CONTROLLER_ADDRESS = "0x3273C69432b2B0D808499F4Cc56113Be6c7A673F";
const BTC_CALL_CONTROLLER_ADDRESS =
  "0x18AadF2a220D3FEb958Ed161263185f0805D11a1";
const USDC_ARB_ADDRESS = ADDRESSES.arbitrum.USDC_CIRCLE;
const USDC_BSC_ADDRESS = ADDRESSES.bsc.USDC;

module.exports = {
  methodology: "TVL counts the USDC held in the controller contracts.",
  start: 1715693000,
  arbitrum: {
    tvl: sumTokensExport({
      owners: [
        ETH_PUT_CONTROLLER_ADDRESS,
        ETH_CALL_CONTROLLER_ADDRESS,
        BTC_PUT_CONTROLLER_ADDRESS,
        BTC_CALL_CONTROLLER_ADDRESS,
      ],
      tokens: [USDC_ARB_ADDRESS],
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: [
        ETH_PUT_CONTROLLER_ADDRESS,
        ETH_CALL_CONTROLLER_ADDRESS,
        BTC_PUT_CONTROLLER_ADDRESS,
        BTC_CALL_CONTROLLER_ADDRESS,
      ],
      tokens: [USDC_BSC_ADDRESS],
    }),
  },
}; // node test.js projects/mint-club/index.js
