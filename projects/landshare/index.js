const { pool2 } = require('../helper/pool2')
const { staking } = require('../helper/staking')
const LANDSHARE_TOKEN_CONTRACT = '0xA73164DB271931CF952cBaEfF9E8F5817b42fA5C'
const LANDSHARE_STAKING_CONTRACT = '0x3f9458892fB114328Bc675E11e71ff10C847F93b'
const LANDSHARE_LP_TOKEN_CONTRACT = '0x13f80c53b837622e899e1ac0021ed3d1775caefa'

module.exports = {
  bsc: {
    tvl: () => ({}),
    staking: staking(LANDSHARE_STAKING_CONTRACT, LANDSHARE_TOKEN_CONTRACT),
    pool2: pool2(LANDSHARE_STAKING_CONTRACT, LANDSHARE_LP_TOKEN_CONTRACT),
  },
}