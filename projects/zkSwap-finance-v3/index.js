const { uniV3Export } = require('../helper/uniswapV3')

const config = {
  era: {
    factoryV3: '0x88ADD6a7e3C221e02f978B388a092c9FD8cd7850',
  },
  sonic: {
    factoryV3: '0x6D977fCC945261B80D128A5a91cbF9a9148032A4'
  },
  monad: {
    factoryV3: '0xf5Cf2b71B8B368c84C4C4903AF453E790d392285'
  }
}

module.exports = uniV3Export({
  era: { factory: config.era.factoryV3, fromBlock: 49205949 },
  sonic: { factory: config.sonic.factoryV3, fromBlock: 18849171, 
    blacklistedTokens: [
      '0xE0590015A873bF326bd645c3E1266d4db41C4E6B',
      '0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50'
    ]
   },
  monad: { factory: config.monad.factoryV3, fromBlock: 37612083},
})
