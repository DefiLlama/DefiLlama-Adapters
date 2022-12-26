const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
  bsc: {
    tvl: getUniTVL({ chain: 'bsc', factory: '0xb3456550c17128ca7ebbcc47d4be6cae29d43853', }),
    staking: staking('0x0AEfF3d761F6706295f3828C87ccE29c9418a93B', '0x17E65E6b9B166Fb8e7c59432F0db126711246BC0', 'bsc')
  }
}
