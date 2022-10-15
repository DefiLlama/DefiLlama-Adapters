const { unknownTombs } = require("../helper/unknownTokens")

const token = ["0x96b451770772e64a582685d5EDCdfe53A5CD8718","0x2963DAfc960310b400Ed4D4539a9afD40dA1C949"]
const rewardPool = ["0x69F451a527484159F27F34f6A5bd21727434027e"]
const lps = Object.values({
    'LION-USDC-LP': '0xDcDc159cA74c727a8a34e311Ce6Fbd1274B6CBe9',
    'TIGER-USDC-LP': '0x3cDA4fE281230B58935b24fB74B4177668b74F18',
    'BEAR-WBTC-LP': '0x59F6b8e4FcB4089b8b9C9A1a42104B7c6C77B8A4',
})

module.exports = unknownTombs({
  lps,
  shares: [
    '0x398046624dF74d5038F2Fae49fDFC8d6bedC74f3', //Tiger
  ],
  rewardPool,
  masonry: [
    '0x1810F07671fFF4D03110Ec3bA9B3C8E88D88Ed89',
  ],
  chain: 'kava',
  useDefaultCoreAssets: true,
})
module.exports.misrepresentedTokens = true
