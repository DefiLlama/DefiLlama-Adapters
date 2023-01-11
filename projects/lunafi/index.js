const { staking } = require('../helper/staking');
const { pool2 } = require('../helper/pool2');
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  polygon: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', '0x1311DCADf3330dD0AEB4d03177F9568880Febb34'],
        ['0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', '0x2Bb91032F277BDc0DA7De271Ba03B3341B73b4c1'],
        ['0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', '0x14e849B39CA7De7197763b6254EE57eDBE0F3375'],
      ]
    }),
    pool2: pool2('0x4175acd3d7f128cf41d42826cce2185a5ade7c82', ['0x72CF5ee9ee918a529b25BBcB0372594008178535', '0xE3108CDCfb18E7B3e558b37bfD4473CBDE1Fd05c']),
    staking: staking('0xfc604b6fD73a1bc60d31be111F798dd0D4137812', '0x77d97db5615dfe8a2d16b38eaa3f8f34524a0a74'),
  }
};