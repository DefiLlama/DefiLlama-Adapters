const ADDRESSES = require('../helper/coreAssets.json')
/**
 * lp token addresses
 */
// Main
const MAIN_USDC_LP = "0x4B780D14CF44302908b1700E5Ad2f746C70b1c9E";
const MAIN_USDT_LP = "0x3dc2a544A3A9C4D86d58D52bCaD1ECA8c1EC2361";
const MAIN_DAI_LP = "0x59a49E5bd704fC70E2cD9fe3d4D5D03991278015";
const MAIN_MAI_LP = "0xD0dCF24aA7784e34F022AdF43447578e54e2a695";

const USDC = ADDRESSES.polygon.USDC;
const USDT = ADDRESSES.polygon.USDT;
const DAI = ADDRESSES.polygon.DAI;
const MAI = "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1";
 
module.exports = {
  DAI: {
    id: "dai",
    addresses: [
      {
        token: DAI,
        lpTokens: [MAIN_DAI_LP],
      },
    ],
  },
  USDC: {
    id: "usdc",
    addresses: [
      {
        token: USDC,
        lpTokens: [
          MAIN_USDC_LP,
        ],
      },
    ],
  },
  USDT: {
    id: "usdt",
    addresses: [
      {
        token: USDT ,
        lpTokens: [MAIN_USDT_LP],
      },
    ],
  },
  MAI: {
    id: "mai",
    addresses: [
      {
        token: MAI,
        lpTokens: [MAIN_MAI_LP],
      },
    ],
  },
};
