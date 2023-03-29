const {uniTvlExport} = require('../helper/calculateUniTvl.js')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  kava:{
    tvl: uniTvlExport("0xA138FAFc30f6Ec6980aAd22656F2F11C38B56a95", "kava", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: true, }),
    staking: staking("0x35361C9c2a324F5FB8f3aed2d7bA91CE1410893A", "0xE1da44C0dA55B075aE8E2e4b6986AdC76Ac77d73","kava"),
  },
}
