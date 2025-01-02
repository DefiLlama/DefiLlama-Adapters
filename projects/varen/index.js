const { staking } = require('../helper/staking');
const { pool2 } = require('../helper/pool2');
const { getUniTVL } = require('../helper/unknownTokens')

const stakingRewards = "0x25a25e2f0d2c211a96fa35e8c670ef6f5b3aba57"
module.exports = {
  start: '2020-11-26', // 11/26/2020 @ 12:08:48am (UTC)
  ethereum:{
    staking: staking(stakingRewards, "0x72377f31e30a405282b522d588aebbea202b4f23"),
    pool2: pool2(stakingRewards, "0x88024deacdc2e9eda02a3051377ed635381faa54"),
    tvl: getUniTVL({
      factory: '0x696708db871b77355d6c2be7290b27cf0bb9b24b',
      useDefaultCoreAssets: true,
    })
  }
};
