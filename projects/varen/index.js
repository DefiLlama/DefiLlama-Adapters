const {calculateUniTvl} = require('../helper/calculateUniTvl');
const { staking } = require('../helper/staking');
const { pool2 } = require('../helper/pool2');

async function tvl(timestamp, block) {
  return calculateUniTvl(id=>id, block, 'ethereum', '0x696708db871b77355d6c2be7290b27cf0bb9b24b', 11330678, false)
}

const stakingRewards = "0x25a25e2f0d2c211a96fa35e8c670ef6f5b3aba57"
module.exports = {
  start: 1606392528, // 11/26/2020 @ 12:08:48am (UTC)
  ethereum:{
    staking: staking(stakingRewards, "0x72377f31e30a405282b522d588aebbea202b4f23"),
    pool2: pool2(stakingRewards, "0x88024deacdc2e9eda02a3051377ed635381faa54"),
    tvl
  }
};
