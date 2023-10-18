const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  mantle: {
    tvl: sumTokensExport({
      owner: '0x78B2fa94A94bF3E96fcF9CE965bed55bE49FA9E7',
      tokens: [
        ADDRESSES.scroll.WETH,
        "0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97", // DAI
        "0xeDEAbc3A1e7D21fE835FFA6f83a710c70BB1a051", // LUSD
        "0x53878B874283351D26d206FA512aEcE1Bef6C0dD", // rETH
        "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4", // USDC
        "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df", // USDT
        "0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1", // WBTC
        "0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32" // wstETH

      ]
    }),
  }
}
