const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")
const iBTC_arbitrum = '0x050C24dBf1eEc17babE5fc585F06116A259CC77A'
const WSOL_arbitrum = '0x2bcC6D6CdBbDC0a4071e48bb3B969b06B3330c07'
const UNI_arbitrum = '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0'
const cbBTC_base = ADDRESSES.ethereum.cbBTC
const USDC_btr = '0xf8c374ce88a3be3d374e8888349c7768b607c755'
const USDT_btr = ADDRESSES.btr.USDT
module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [
        '0x34Eda05F73f30B43d4c53cdCE830C27291785F96', // ETH CALL
        '0x5ffff66C4BE400185eE9CF903a76e7845b6998d3', // WBTC CALL 
        '0xD02e2EB6Cda2df3c4b3d4157F15e45573DE5BEDa', // iBTC CALL 
        '0x5388504406adAB83be8dCc6FE6dF94B3F44EEeeD', // ETH WBTC iBTC PUT 
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
        '0x5CDF70b831A84B11FC480528116248BA7F91cc62', // cbBTC CALL
        '0x5CFa6c853De2BC1F64e52DaF3478e51aF642860c', // cbBTC PUT
      ],
      tokens: [ADDRESSES.null, cbBTC_base, ADDRESSES.base.USDC]
    })
  },
  btr: {
    tvl: sumTokensExport({
      owners: [
        '0xB0c78bcC1508CEe4c487C27e65797d421D95da07', // BTC CALL 0.5H
        '0xd3e0c9729d3f379ac3f7326860c5965a3f777294', // BTC PUT 1H-24H
        '0x3166cd13b1779cb0234e9b63f42f3e8bb6d7050d'  // BTC PUT
      ],
      tokens: [
        ADDRESSES.null,
        USDC_btr,
        USDT_btr
      ]
    })
  }
}
