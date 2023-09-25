const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require("../helper/treasury");

const LVL = '0xb64e280e9d1b5dbec4accedb2257a87b400db149';

module.exports = treasuryExports({
  bsc: {
    tokens: [
      "0xb5c42f84ab3f786bca9761240546aa9cec1f8821",
    ],
    owners: [
      '0x8BFf27E9Fa1C28934554e6B5239Fb52776573619',
      '0xb07953f23545796710957faec97f05b21146ac2d',
      '0x92a0a11a57c28d4c86a629530fd59b83b1276003',
      '0x712a2e08c67cd7153f04fdb3037d4696300921d0',
    ],
    ownTokens: [LVL],
  },
  arbitrum: {
    tokens: [
      ADDRESSES.arbitrum.WETH,
      ADDRESSES.arbitrum.WBTC,
      ADDRESSES.arbitrum.USDT,
      ADDRESSES.arbitrum.USDC,
      ADDRESSES.arbitrum.ARB,
      "0x502697AF336F7413Bb4706262e7C506Edab4f3B9",
      "0xb076f79f8D1477165E2ff8fa99930381FB7d94c1",
      "0x5573405636F4b895E511C9C54aAfbefa0E7Ee458",
    ],
    owners: [
      '0x635aac65f37a6bbe06a2dde77b0fd2f1748674d4',
      '0x4b47ef68180ec46a0b6be4d34fd9d8680bee2b2c',
    ],
    ownTokens: [LVL],
  },
})
