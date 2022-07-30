const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  conflux: {
    tvl: getUniTVL({
      factory: '0xe2a6f7c0ce4d5d300f97aa7e125455f5cd3342f5',
      chain: 'conflux',
      coreAssets: [
        '0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b', // WCFX
        '0x1f545487c62e5acfea45dcadd9c627361d1616d8', // WBTC
        '0xa47f43de2f9623acb395ca4905746496d2014d57', // ETH
        // '0x6963efed0ab40f6c3d7bda44a05dcf1437c44372', // USDC
        '0xfe97e85d13abd9c1c33384e796f10b73905637ce', // USDT
      ]
    }),
  }

} 
