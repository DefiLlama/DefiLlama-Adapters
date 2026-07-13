const { stakings: stakingsHelper } = require("../helper/staking");
const { pool2s: pool2sHelper } = require("../helper/pool2");

const BSC_RFOX = '0x0a3a21356793b49154fd3bbe91cbc2a16c0457f5'
const BSC_VFOX = '0x4d61577d8fd2208a0afb814ea089fdeae19ed202'

const BSC_RFOX_STAKINGS = [
  '0x60a3bd6d8d42546a57aea8b8456f2330619b5acc',
  '0x273dF269759A319cFbC052585A3eB45d67A8E67A',
  '0xff0394014519a7334c8ffc886ea74cdd60229ec0']

const BSC_VFOX_STAKINGS = [
  '0x60a3bd6d8d42546a57aea8b8456f2330619b5acc',
  '0xa494d1F0AbdA95F84600C195Bc6dd719e2F10fF0',
  '0xebcc34134dc3107f0fb285629c041606cfa1f5be',
  '0xD1841F1964b3Ac7ab4bDabF9C62720fA669A7040'
]


const calculateBscStakings = async function(...params) {
  const [rfoxData, vfoxData] = await Promise.all([
    stakingsHelper(BSC_RFOX_STAKINGS, BSC_RFOX)(...params),
    stakingsHelper(BSC_VFOX_STAKINGS, BSC_VFOX)(...params)
  ]);

  return {
    ...rfoxData,
    ...vfoxData
  }
}

const stakings = {
  bsc: {
    staking: calculateBscStakings
  },
};

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

const pool2s = {
  bsc: {
    pool2: pool2sHelper(stakingContracts, lpTokens),
  },
}

module.exports = {
 methodology: "Counts Pools and Stakings on both Rfox and Vfox",
 ...stakings,
 bsc: {
  tvl: (async) => ({}),
  ...stakings.bsc,
  ...pool2s.bsc
 }
};
