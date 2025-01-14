const { uniV3Export } = require('../helper/uniswapV3')
const { staking } = require('../helper/staking')

module.exports = uniV3Export({
  smartbch: { factory: '0x08153648C209644a68ED4DC0aC06795F6563D17b', fromBlock: 14169895 },
  base: { factory: '0xE82Fa4d4Ff25bad8B07c4d1ebd50e83180DD5eB8', fromBlock: 21481309 },
  bsc: { factory: '0x30D9e1f894FBc7d2227Dd2a017F955d5586b1e14', fromBlock: 42363117 },
})

module.exports.smartbch.staking = staking('0xfA3D02c971F6D97076b8405500c2210476C6A5E8','0x56381cb87c8990971f3e9d948939e1a95ea113a3')
module.exports.bsc.staking = staking('0xb4d117f9c404652030f3d12f6de58172317a2eda','0x701aca29ae0f5d24555f1e8a6cf007541291d110')
module.exports.base.staking = staking('0x866932399DEBdc1694Da094027137Ebb85D97206','0xcdba3e4c5c505f37cfbbb7accf20d57e793568e3')
