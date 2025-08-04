const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");


const matrixGenesisPool = '0x068112669651f2a0DbD5B97dd03077464cba5Ea8'
const tokens = [
  ADDRESSES.sonic.wS,  // S
  ADDRESSES.sonic.STS,  // stS
  ADDRESSES.sonic.USDC_e,  // USDC.e
  ADDRESSES.sonic.scUSD,  // scUSD
  "0x44E23B1F3f4511b3a7e81077Fd9F2858dF1B7579",  // MCLB
  "0x79bbF4508B1391af3A0F4B30bb5FC4aa9ab0E07C",  // ANON
  "0x3333111A391cC08fa51353E9195526A70b333333",  // X33
  "0x9fDbC3f8Abc05Fa8f3Ad3C17D2F806c1230c4564",  // GOGLZ
]

module.exports = {
  methodology: "This is only the TVL of the genesis pools ",
  sonic: {
    tvl: sumTokensExport({ owner: matrixGenesisPool, tokens }),
    pool2: sumTokensExport({
      owner: matrixGenesisPool, tokens: [
        "0x37C4c5e345ae4d4041b7f519343f942716fc6fE6", // MATRIX-S LP
      ]
    }),
  },
};