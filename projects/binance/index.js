const config = require('./config')
const { cexExports } = require('../helper/cex')
const { mergeExports, getStakedEthTVL } = require("../helper/utils");

const withdrawalAddresses = [
  '0x6454ac71ca260f99cca99a3f4241dfda20cfa965',
  '0xdbeb6c856ef5a167f5e1acb9dff65adb33207d8b',
  '0x42a93a9f5cfda54716c414b6eaf07cf512f46ead',
  '0x8498fc7280668874a5da79e87ca0896f4f0d1196',
  '0x8e609ac80f4324e499a6efd24f221a2caa868224',
  '0xdbf28a152d79b2b98eecd229b412ee98d21ec3bc',
  '0x110daa3f3fac2a54bb508ac94f31f9df77057b29',
  '0xfc8059c2fb22005ede8a86d388e3d0f536a4dd44',
  '0xf16924b866e58ac916ba933d1f1034bcbbb1958c',
  '0x150aace136535a374f05b5ee209b6a61396db1c0',
  '0x8a6f8404c9ea4c33502a3f6a4bf8e41ef5ca10ea',
  '0xa9fc92f6faf9f103fc81d17de3e8daadc888afff',
  '0xc47b3342df38d747033b6041f54e4e5e300c8d18',
  '0xf1f8cb7633d3ca3fd06c084d18ca5491a85ae9b4',
  '0xa345dcb63f984ed1c6d1a8901e0cdbd13b2b4d19',
  '0xd27b39cb25fed854f9fce3a4e451f96e62089e48',
  '0x6357e4bdaff733dfe8f50d12d07c03b3bed0884b',
]

module.exports = mergeExports([
  cexExports(config),
  { ethereum: { tvl: getStakedEthTVL({ withdrawalAddresses: withdrawalAddresses, size: 200, sleepTime: 20_000, proxy: true }) } },
])

module.exports.methodology = 'We collect the wallets from this binance blog post https://www.binance.com/en/blog/community/our-commitment-to-transparency-2895840147147652626. We are not counting the Binance Recovery Fund wallet'