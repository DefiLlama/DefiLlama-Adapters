const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const BREAD_CONTRACT_ADDRESS = "0x0003eEDFdd020bf60D10cf684ABAc7C4534B7eAd";

module.exports = {
  methodology: "Measures the total value of BERA held in the protocol's contract",
  berachain: {tvl: sumTokensExport({ owner: BREAD_CONTRACT_ADDRESS, tokens: [nullAddress]})}
};