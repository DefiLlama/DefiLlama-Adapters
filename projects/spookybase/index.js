const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL, staking } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const uniTvl = getUniTVL({ factory: '0x9EB4C1e84A4ccCbe154B485b9314EF0F9B5b78f8', useDefaultCoreAssets: true, })
const masterchef  = '0x895678a139605AE183Fc753888EcfEb6896267Aa'
const spooky = '0xd63EBbE933f422Bf8BC6F909FA27E467b537ca81'
const weth = ADDRESSES.base.WETH

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: sdk.util.sumChainTvls([uniTvl, staking({
      owners: [masterchef],
      tokens: [weth],
    })]),
    staking: staking({
      owners: [masterchef],
      tokens: [spooky],
    })
  }
};