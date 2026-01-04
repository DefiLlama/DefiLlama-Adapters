const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/sumTokens");

const CLOB_GATEWAY = "0x0101010101010101010101010101010101010101";

module.exports = {
  methodology: "TVL is calculated as the sum of all assets deposited in the SoDex ClobGateway contract.",
  valuechain: {
    tvl: sumTokensExport({
      owners: [CLOB_GATEWAY],
      tokens: [
        ADDRESSES.valuechain.WSOSO,
        ADDRESSES.valuechain.sSOSO,
        ADDRESSES.valuechain.vUSDC,
        ADDRESSES.valuechain.vETH,
        ADDRESSES.valuechain.vBTC,
        ADDRESSES.valuechain.vSOL,
        ADDRESSES.valuechain.vDOGE,
        ADDRESSES.valuechain.vLINK,
        ADDRESSES.valuechain.vPEPE,
        ADDRESSES.valuechain.vUNI,
        ADDRESSES.valuechain.vBNB,
        ADDRESSES.valuechain.vXAUt,
        ADDRESSES.valuechain.vAAVE,
        ADDRESSES.valuechain.vADA,
        ADDRESSES.valuechain.vHYPE,
        ADDRESSES.valuechain.vLTC,
        ADDRESSES.valuechain.vXRP,
        ADDRESSES.valuechain.vMAG7,
        ADDRESSES.valuechain.vsMAG7,
        ADDRESSES.valuechain.vCRCLx,
      ],
    }),
  },
};

