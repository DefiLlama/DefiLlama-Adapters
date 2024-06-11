const { sumTokensExport } = require("../helper/unwrapLPs");
const ETH_PUT_CONTROLLER_ADDRESS = "0x55E008E3b0Aa6808Ca8B8Ba1DC319EC132554aCd";
const ETH_CALL_CONTROLLER_ADDRESS =
  "0x2eEFcBCa065bE1763be58276AFA41627A82dfa2D";
const BTC_PUT_CONTROLLER_ADDRESS = "0x3273C69432b2B0D808499F4Cc56113Be6c7A673F";
const BTC_CALL_CONTROLLER_ADDRESS =
  "0x18AadF2a220D3FEb958Ed161263185f0805D11a1";
const USDC_ARB_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const USDC_BSC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

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
