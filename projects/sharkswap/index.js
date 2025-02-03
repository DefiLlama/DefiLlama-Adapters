const { staking } = require('../helper/staking');
const { sumTokensExport, getUniTVL } = require('../helper/unknownTokens');

// SX (legacy)

const sxTvl = getUniTVL({
  factory: '0x6A482aC7f61Ed75B4Eb7C26cE8cD8a66bd07B88D',
  useDefaultCoreAssets: true,
})

// SXR (current)

const uniTvl = getUniTVL({
  factory: '0x610CfC3CBb3254fE69933a3Ab19aE1bF2aaaD7C8',
  useDefaultCoreAssets: true,
})

const escrowTvl = sumTokensExport({
  owner: '0x9039A2F174Ca7AfF96C983CAfB6EAC356a87edE7',
  tokens: ['0x3E96B0a25d51e3Cc89C557f152797c33B839968f', '0x6629Ce1Cf35Cc1329ebB4F63202F3f197b3F050B'],
})

const stakingTvl = staking('0x2083eF16cc1749c98F101E41Dba9b9472D4C5702', '0x3E96B0a25d51e3Cc89C557f152797c33B839968f');

module.exports = {
  sx: {
    tvl: sxTvl,
  },
  sxr: {
    tvl: uniTvl,
    tvl: escrowTvl,
    staking: stakingTvl,
  },
};
