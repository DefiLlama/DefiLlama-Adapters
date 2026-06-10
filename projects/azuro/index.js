const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const tokensAndOwners = {
  xdai: [
    [ADDRESSES.xdai.WXDAI, '0xac004b512c33D029cf23ABf04513f1f380B3FD0a'], // V1 LP
    [ADDRESSES.xdai.WXDAI, '0x204e7371Ade792c5C006fb52711c50a7efC843ed'], // V2 LP
    [ADDRESSES.xdai.WXDAI, '0x14564e6BbbB8DE2f959af8c0e158D334F05393Bb'], // V3 Vault
    [ADDRESSES.xdai.WXDAI, '0xeb7cDA87D00d677A6Dc73EB569723b0fA51D97E7'], // V3 LP (locked)
  ],
  polygon: [
    [ADDRESSES.polygon.USDC,  '0x2a838ab9b037db117576db8d0dcc3b686748ef7c'], // V2 USDC LP
    [ADDRESSES.polygon.USDT,  '0x7043E4e1c4045424858ECBCED80989FeAfC11B36'], // V2 USDT LP
    [ADDRESSES.polygon.USDT,  '0x1a0612FE7D0Def35559a1f71Ff155e344Ae69d2C'], // V3 Vault
    [ADDRESSES.polygon.USDT,  '0x0FA7FB5407eA971694652E6E16C12A52625DE1b8'], // V3 LP (locked)
  ],
  base: [
    [ADDRESSES.base.WETH, '0xF22E9e29728d6592eB54b916Ba9f464d9F237dB1'], // V2 LP
    [ADDRESSES.base.WETH, '0xbA390F464395fC0940c0B9591847ad4E836C7A0c'], // V3 Vault
    [ADDRESSES.base.WETH, '0x1eD7368bc515E928A4007cEa61FB8a6F8863Af87'], // V3 LP (locked)
  ],
  arbitrum: [
    [ADDRESSES.arbitrum.USDT, '0x20513ba6A4717c67e14291331BC99dd2aCE90038'], // V2 LP
  ],
  linea: [
    [ADDRESSES.linea.USDT, '0xc365224ef4Fa75D56a280C5A3925caDbF7bd8eeE'], // V2 LP
  ],
  chz: [
    [ADDRESSES.chz.WCHZ_1, '0x32696E01c979E3F542EC49D95729f011eF8F3c28'], // V3 Vault
    [ADDRESSES.chz.WCHZ_1, '0xEf6b12580301b04CD2551182C88623524B6e47b8'], // V3 LP (locked)
  ],
}

const chainTvl = (chain) => async (api) => sumTokens2({ api, tokensAndOwners: tokensAndOwners[chain] })

module.exports = {
  methodology: `TVL is the collateral (WXDAI, USDC, USDT, WETH, CHZ) held by every Azuro liquidity contract: the V1/V2 LP pools and the V3 Vaults plus the liquidity locked in the V3 LP contracts.`,
  ...Object.fromEntries(Object.keys(tokensAndOwners).map((chain) => [chain, { tvl: chainTvl(chain) }])),
}
