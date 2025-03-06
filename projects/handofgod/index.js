const { sumTokensExport } = require("../helper/unwrapLPs");


const hogGenesisAddress = '0x2e585b96a2ef1661508110e41c005be86b63fc34'
const tokens = [
  "0xb1e25689D55734FD3ffFc939c4C3Eb52DFf8A794",  // OS 19% 
  "0x79bbF4508B1391af3A0F4B30bb5FC4aa9ab0E07C",  // Anon 10% 
  "0x44E23B1F3f4511b3a7e81077Fd9F2858dF1B7579",  // Mclb 9% 
  "0xA04BC7140c26fc9BB1F36B1A604C7A5a88fb0E70",  // SWPx 11% 
  "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955",  // stS 7% 
  "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE",  // scUSD 7% 
  "0x4EEC869d847A6d13b0F6D1733C5DEC0d1E741B4f",  // Indi 4% 
  "0x9fDbC3f8Abc05Fa8f3Ad3C17D2F806c1230c4564",  // Goglz 4% 
  "0x2D0E0814E62D80056181F5cd932274405966e4f0",  // Beets 2%
]

module.exports = {
  methodology: "This is only the TVL of the genesis pools ",
  sonic: {
    tvl: sumTokensExport({ owner: hogGenesisAddress, tokens }),
    pool2: sumTokensExport({
      owner: hogGenesisAddress, tokens: [
        "0X784DD93F3c42DCbF88D45E6ad6D3CC20dA169a60", // HOG-OS LP
      ]
    }),
  },
};