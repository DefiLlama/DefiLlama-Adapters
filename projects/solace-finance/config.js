const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
  ethereum: {
    solace: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    lp: '0x9C051F8A6648a51eF324D30C235da74D060153aC',
    uwp_address: '0x5efC0d9ee3223229Ce3b53e441016efC5BA83435',
    tokens: [
      {
        PoolToken: ADDRESSES.ethereum.FRAX,
        TokenTicker: "FRAX",
      },
      {
        PoolToken: ADDRESSES.ethereum.USDC,
        TokenTicker: "USDC",
      },
      {
        PoolToken: ADDRESSES.ethereum.USDT,
        TokenTicker: "USDT",
      },
      {
        PoolToken: ADDRESSES.ethereum.DAI,
        TokenTicker: "DAI",
      },
      {
        PoolToken: ADDRESSES.ethereum.WETH,
        TokenTicker: "WETH",
      },
      {
        PoolToken: ADDRESSES.ethereum.WBTC,
        TokenTicker: "WBTC",
      },
    ]
  },
  polygon: {
    uwp_address: '0xd1108a800363C262774B990e9DF75a4287d5c075',
    solace: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    tokens: [
      {
        PoolToken: ADDRESSES.polygon.WMATIC_2,
        TokenTicker: "WMATIC",
      },
      {
        PoolToken: "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89",
        TokenTicker: "FRAX",
      },
      {
        PoolToken: ADDRESSES.polygon.USDC,
        TokenTicker: "USDC",
      },
      {
        PoolToken: ADDRESSES.polygon.USDT,
        TokenTicker: "USDT",
      },
      {
        PoolToken: ADDRESSES.polygon.DAI,
        TokenTicker: "DAI",
      },
      {
        PoolToken: ADDRESSES.polygon.WETH_1,
        TokenTicker: "WETH",
      },
      {
        PoolToken: ADDRESSES.polygon.WBTC,
        TokenTicker: "WBTC",
      },
    ]
  },
  aurora: {
    uwp_address: '0x4A6B0f90597e7429Ce8400fC0E2745Add343df78',
    solace: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    lp: '0xdDAdf88b007B95fEb42DDbd110034C9a8e9746F2',
    tokens: [
      {
        PoolToken: ADDRESSES.aurora.NEAR,
        TokenTicker: "WNEAR",
      },
      {
        PoolToken: ADDRESSES.aurora.AURORA,
        TokenTicker: "AURORA",
      },
      {
        PoolToken: ADDRESSES.aurora.FRAX,
        TokenTicker: "FRAX",
      },
      {
        PoolToken: ADDRESSES.aurora.USDC_e,
        TokenTicker: "USDC",
      },
      {
        PoolToken: ADDRESSES.aurora.USDT_e,
        TokenTicker: "USDT",
      },
      {
        PoolToken: "0xe3520349F477A5F6EB06107066048508498A291b",
        TokenTicker: "DAI",
      },
      {
        PoolToken: "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB",
        TokenTicker: "WETH",
      },
      {
        PoolToken: "0xf4eb217ba2454613b15dbdea6e5f22276410e89e",
        TokenTicker: "WBTC",
      },
    ]
  }
}