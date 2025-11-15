const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const tokensAndOwners = {
  xdai: [[ADDRESSES.xdai.WXDAI, '0x14564e6BbbB8DE2f959af8c0e158D334F05393Bb']],
  polygon: [[ADDRESSES.polygon.USDT, '0x1a0612FE7D0Def35559a1f71Ff155e344Ae69d2C']],
  chz: [[ADDRESSES.chz.WCHZ_1, '0x32696E01c979E3F542EC49D95729f011eF8F3c28']],
  base: [[ADDRESSES.base.WETH, '0xbA390F464395fC0940c0B9591847ad4E836C7A0c']],
}

module.exports = {
  xdai: { tvl: async (api) => sumTokens2({ api, tokensAndOwners: tokensAndOwners.xdai }) },
  polygon: { tvl: async (api) => sumTokens2({ api, tokensAndOwners: tokensAndOwners.polygon }) },
  chz: { tvl: async (api) => sumTokens2({ api, tokensAndOwners: tokensAndOwners.chz }) },
  base: { tvl: async (api) => sumTokens2({ api, tokensAndOwners: tokensAndOwners.base }) },
  methodology: `TVL is the total amount of WXDAI, WETH, USDT and CHZ held on Liquidity pools' smart-contracts.`
}
