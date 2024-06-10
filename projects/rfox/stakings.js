const { stakings } = require("../helper/staking");

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
    stakings(BSC_RFOX_STAKINGS, BSC_RFOX)(...params),
    stakings(BSC_VFOX_STAKINGS, BSC_VFOX)(...params)
  ]);

  return {
    ...rfoxData,
    ...vfoxData
  }
}


module.exports = {
  bsc: {
    staking: calculateBscStakings
  },
};

