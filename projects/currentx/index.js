const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL, staking } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const uniTvl = getUniTVL({ factory: '0x1F49127E87A1B925694a67C437dd2252641B3875', useDefaultCoreAssets: true })
const masterchef  = '0x0e59533B28df0537bc28D05618a2c4f20EBE07a0'
const crx = '0x128D4F902eC739339F05bbCE778Fb474ba7617b0'
const weth = ADDRESSES.megaeth.WETH

module.exports = {
  misrepresentedTokens: true,
  megaeth: {
    tvl: sdk.util.sumChainTvls([uniTvl, staking({
      owners: [ masterchef],
      tokens: [weth],
    })]),
    staking: staking({
      owners: [ masterchef],
      tokens: [crx],
    })
  }
};