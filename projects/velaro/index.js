const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
module.exports = {
  hallmarks: [
    [1668556800, "USDV hack"]
  ],
  velas: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.velas.WVLX, '0xbd183a60274289A7c20250a890500D2a37dEf319'], // VLX
        ['0xaBf26902Fd7B624e0db40D31171eA9ddDf078351', '0x2Fee5293050FFfC3bd583d59f077e2b4900F57c8'], // WAG
        [ADDRESSES.moonriver.ETH, '0x899F26dc6Bc085fb9cB82AAdF25Db8820F272ED4'], // WBTC
        ['0x7b714BC5dD176EaA198fe6C07E415a87A40dc858', '0x7171d1E1097d726E5f4BBc8236A8E108E21024e3'], // WAG_VLXVDGT
        ['0x72eB7CA07399Ec402c5b7aa6A65752B6A1Dc0C27', '0x1e217990818518Dc37B0fFA2ffE3AA110b02F18c'], // ASTRO 
        [ADDRESSES.velas._BNB, '0xc0D16c7Cd5Fc18526Dc78Ea530e56129EB979C96'], // BNB
        [ADDRESSES.velas.FTM, '0x92C2cA50f74A8Fe36b4DCffB2cc6A274fA61CB34'], // FTM
        [ADDRESSES.velas._MATIC, '0xd10f8CD5d56aaa58f59B25C928f372F66899e9B3'], // MATIC
        [ADDRESSES.velas.BUSD, '0x4368d9F91C40EA8Ac9F11A4f9289889f56D32Df8'], // BUSD
      ],
      resolveLP: true,
    })
  }
}
