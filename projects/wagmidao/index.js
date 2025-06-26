const masterChef = "0xf046e84439813bb0a26fb26944001c7bb4490771";
const stakingContract = "0xaa2c3396cc6b3dc7b857e6bf1c30eb9717066366";

const GMI = "0x8750f5651af49950b5419928fecefca7c82141e3";

const { uniTvlExports } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
module.exports = uniTvlExports({
  'harmony': '0xfe33b03a49a1fcd095a8434dd625c2d2735e84b8'
}, { staking: { harmony: [[stakingContract, masterChef], GMI]}})
