const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");
const USDTpolygon = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const USDTbsc = "0x55d398326f99059fF775485246999027B3197955";

const config = {
  bsc: {
    owners: Object.values({
      predictionBNB: "0x31B8A8Ee92961524fD7839DC438fd631D34b49C6",
      predictionETH: "0xE39A6a119E154252214B369283298CDF5396026B",
      predictionBTC: "0x3Df33217F0f82c99fF3ff448512F22cEf39CC208",
      predictionPRO: "0x599974D3f2948b50545Fb5aa77C9e0bddc230ADE",
    }),
  },
  polygon: {
    owners: Object.values({
      predictionBTCPOLY: "0xd71b0366CD2f2E90dd1F80A1F0EA540F73Ac0EF6",
      predictionMATIC: "0x59e0aD27d0F58A15128051cAA1D2917aA71AB864",
      predictionPRO: "0x764C3Ea13e7457261E5C1AaD597F281f3e738240",
    }),
  },
};

module.exports = {};

module.exports = {
  bsc: { tvl: sumTokensExport({ chain: "bsc", owners: config.bsc.owners, tokens: [nullAddress, USDTbsc] }) },
  polygon: {
    tvl: sumTokensExport({ chain: "polygon", owners: config.polygon.owners, tokens: [nullAddress, USDTpolygon] }),
  },
};
