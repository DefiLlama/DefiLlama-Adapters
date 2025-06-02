const { pool2s } = require("../helper/pool2");

const lpTokens = [
  '0x8647782fdda507C28bfd0614BF55200050F35dcD',
  '0x8e04b3972b5c25766c681dfd30a8a1cbf6dcc8c1'
]
const stakingContracts = [
  '0x18153F9103cb4B6e1c2C89A0F87bA10baF992723',
  '0xCf1B259031b15aB8445719aF5143Ce8e9AF8148B',
  '0xfbd99f6417c28a120b52439a72e82e2aed73b114',
  '0x8c0c225a5b64997200b3195567b2e649f5ef8510'
]

module.exports = {
  bsc: {
    pool2: pool2s(stakingContracts, lpTokens),
  },
}
