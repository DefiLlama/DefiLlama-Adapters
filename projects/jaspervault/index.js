const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")
const iBTC_arbitrum = '0x050C24dBf1eEc17babE5fc585F06116A259CC77A'
const WSOL_arbitrum = '0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07'
const UNI_arbitrum = '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0'
const cbBTC_base = ADDRESSES.ethereum.cbBTC
const USDC_btr = '0xf8c374ce88a3be3d374e8888349c7768b607c755'
const USDT_btr = '0xfe9f969faf8ad72a83b761138bf25de87eff9dd2'
module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [
        '0x51c83c3FE5a64EDB1DF6649086B98640780c711c', // ETH CALL
        '0xEA0d5ED7B7F9c2E4a07c1683B6b321745f46c437', // WBTC CALL
        '0x0D815bAC1bEd7a0C8072DB141B11A4b704DDF56a', // ARB CALL
        '0x548404E883c6D1a4AE21238A27782b909D4A180a', // WSOL CALL
        '0x20cC817Dc3a523AA6f599160269d87232a89ea9c', // iBTC CALL
        '0x9cF118136E35f9991275F237E141ED89F39F1f0C', // UNI CALL
        '0xBbAb79f11AfdFEa1b89DFfE78A31223EA6D4cbF7', // LINK CALL
        '0xDC4DCCeb96F05A662F1b54f9D750404d7878f254', // ETH WBTC iBTC PUT
        '0x7c790F69D24aA8b86c953757ae1F13249d334d86'  // ARB WSOL UNI LINK PUT
      ],
      tokens: [
        ADDRESSES.arbitrum.WBTC,
        ADDRESSES.null,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.ARB,
        ADDRESSES.arbitrum.LINK,
        UNI_arbitrum,
        WSOL_arbitrum,
        iBTC_arbitrum
      ]
    })
  },
  base: {
    tvl: sumTokensExport({
      owners: [
        '0x4FAF5c3809E8Dc966Ff7AeDDFb501AF6f85Fbeb7', // cbBTC CALL
        '0x6A8F75B0C76d05bc2dD180B8D1C5e612B2D11c8C', // cbBTC PUT
      ],
      tokens: [ADDRESSES.null, cbBTC_base, ADDRESSES.base.USDC]
    })
  },
  btr: {
    tvl: sumTokensExport({
      owners: [
        '0xB0c78bcC1508CEe4c487C27e65797d421D95da07', // BTC CALL 0.5H
        '0x419ee3EBA38d6c4b9F079eBFca2b7C51F137081f', // BTC PUT 1H-24H
        '0x887e4fc820323CF72aeD60b15118A7711Ff07081'  // BTC PUT
      ],
      tokens: [
        ADDRESSES.null,
        USDC_btr,
        USDT_btr
      ]
    })
  }
}
