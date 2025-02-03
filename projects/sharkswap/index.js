const { uniTvlExports } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = uniTvlExports({
  sx: '0x6A482aC7f61Ed75B4Eb7C26cE8cD8a66bd07B88D',
  sxr: '0x610CfC3CBb3254fE69933a3Ab19aE1bF2aaaD7C8',
})

module.exports.sxr.staking = staking('0x2083eF16cc1749c98F101E41Dba9b9472D4C5702', '0x3E96B0a25d51e3Cc89C557f152797c33B839968f')