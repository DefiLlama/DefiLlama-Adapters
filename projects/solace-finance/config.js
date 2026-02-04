const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  ethereum: {
    solace: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    lp: '0x9C051F8A6648a51eF324D30C235da74D060153aC',
    uwp_address: '0x5efC0d9ee3223229Ce3b53e441016efC5BA83435',
    tokens: [
      ADDRESSES.ethereum.FRAX,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.WBTC,
    ]
  },
  polygon: {
    uwp_address: '0xd1108a800363C262774B990e9DF75a4287d5c075',
    solace: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    tokens: [
      ADDRESSES.polygon.WMATIC_2,
      ADDRESSES.polygon.FRAX,
      ADDRESSES.polygon.USDC,
      ADDRESSES.polygon.USDT,
      ADDRESSES.polygon.DAI,
      ADDRESSES.polygon.WETH_1,
      ADDRESSES.polygon.WBTC,
    ]
  },
  aurora: {
    uwp_address: '0x4A6B0f90597e7429Ce8400fC0E2745Add343df78',
    solace: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    lp: '0xdDAdf88b007B95fEb42DDbd110034C9a8e9746F2',
    tokens: [
      ADDRESSES.aurora.NEAR,
      ADDRESSES.aurora.AURORA,
      ADDRESSES.aurora.FRAX,
      ADDRESSES.aurora.USDC_e,
      ADDRESSES.aurora.USDT_e,
      "0xe3520349F477A5F6EB06107066048508498A291b",
      "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB",
      "0xf4eb217ba2454613b15dbdea6e5f22276410e89e",
    ]
  }
}