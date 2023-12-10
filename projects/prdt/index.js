const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require("../helper/unwrapLPs");

const config = {
  ethereum: {
    owners: Object.values({
      predictionPROV2: "0x062EB9830D1f1f0C64ac598eC7921f0cbD6d4841",
    }),
    tokens: [ADDRESSES.null, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC],
  },
  bsc: {
    owners: Object.values({
      predictionBNB: "0x31B8A8Ee92961524fD7839DC438fd631D34b49C6",
      predictionETH: "0xE39A6a119E154252214B369283298CDF5396026B",
      predictionBTC: "0x3Df33217F0f82c99fF3ff448512F22cEf39CC208",
      predictionPRO: "0x599974D3f2948b50545Fb5aa77C9e0bddc230ADE",
      predictionPROV2: "0x22dB94d719659d7861612E0f43EE28C9FF9909C7",
      predictionclassicV3: "0x00199E444155f6a06d74CF36315419d39b874f5c",
    }),
    tokens: [ADDRESSES.null, ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC],
  },
  polygon: {
    owners: Object.values({
      predictionBTCPOLY: "0xd71b0366CD2f2E90dd1F80A1F0EA540F73Ac0EF6",
      predictionMATIC: "0x59e0aD27d0F58A15128051cAA1D2917aA71AB864",
      predictionPRO: "0x764C3Ea13e7457261E5C1AaD597F281f3e738240",
      predictionPROV2: "0x8251E5EBc2d2C20f6a116144800D569FAF75d746",
      predictionclassicv3: "0x9f9564BE7b566dfE4B091a83a591752102aF3F33",
    }),
    tokens: [ADDRESSES.null, ADDRESSES.polygon.USDT, ADDRESSES.polygon.USDC],
  },
};


Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: sumTokensExport(config[chain]) }
})
