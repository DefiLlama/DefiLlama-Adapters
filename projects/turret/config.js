const ADDRESSES = require('../helper/coreAssets.json')
// Turret contract inventory on Robinhood Chain. Hardcoded because no factory or registry
// exposes these contracts on-chain

module.exports = {
  usdg: ADDRESSES.robinhood.USDG,
  legacyVault: '0x24043E8EFaB262f5198B87b5AA5A46Bc72AADDD8',
  nftMarket: '0x79F986A54965EB4AB2eB317d9c5e33074793Dd28',
  // { engine, collateral } per pooled credit market, comment is the collateral symbol
  engines: [
    { engine: '0xb9123E508bffEb32E0e7d5D2D8EE5917F54ccc63', collateral: ADDRESSES.robinhood.AAPL }, // AAPL
    { engine: '0xEEE8622810616AC4A336B8cDb353D0Ddf11c884B', collateral: '0xe93237C50D904957Cf27E7B1133b510C669c2e74' }, // MSFT
    { engine: '0xd76F143Bae0277Cc556D97ad978f18a0fdCd130e', collateral: ADDRESSES.robinhood.GOOGL }, // GOOGL
    { engine: '0x7c1abcfe307c6575487e182D94b767f1FC49ED22', collateral: ADDRESSES.robinhood.AMZN }, // AMZN
    { engine: '0x96714F255609381C75c1E88D08846D9eD229dC62', collateral: ADDRESSES.robinhood.META }, // META
    { engine: '0x1916D155e580ff6f4A7724d630A27F2f12b6Eb85', collateral: ADDRESSES.robinhood.NVDA }, // NVDA
    { engine: '0x6d13b38bb018f9fFdba625626e907210fb74421C', collateral: ADDRESSES.robinhood.AMD }, // AMD
    { engine: '0xb41276421e5aE67C0c31b2B04bCFA0DeE4e62A33', collateral: ADDRESSES.robinhood.MU }, // MU
    { engine: '0xe07EEd598ACb608c69802D00BaFea6A3926c7980', collateral: ADDRESSES.robinhood.TSLA }, // TSLA
    { engine: '0x7b08E0E9520f3D4E2d59EF4EFc9db032E41399F8', collateral: ADDRESSES.robinhood.CASHCAT }, // CASHCAT
    { engine: '0x8802c550b21C870dE29052CFAE5c719613440e87', collateral: '0x411eFb0E7f985935DAec3D4C3ebaEa0d0AD7D89f' }, // SLV
    { engine: '0xf7a3dE21eced50bF0E439822273DA503Fe10C7B7', collateral: ADDRESSES.robinhood.AAPL }, // AAPL
    { engine: '0x1a3656f815BBb53cBFaA7e9F63AA97c42324A2C9', collateral: '0xe93237C50D904957Cf27E7B1133b510C669c2e74' }, // MSFT
    { engine: '0x072E65420C618Ce0aa5ac5628bE8Cf471E5F5b5B', collateral: ADDRESSES.robinhood.GOOGL }, // GOOGL
    { engine: '0xEB39cd2bD899CF7A13B4e4b92050a56028e7473d', collateral: ADDRESSES.robinhood.AMZN }, // AMZN
    { engine: '0x76224138d8057B970383c5A92d0C171EDf8ceb03', collateral: ADDRESSES.robinhood.META }, // META
    { engine: '0xad34D8Ee4965672dd989808abbcAa35A8895bFE8', collateral: ADDRESSES.robinhood.NVDA }, // NVDA
    { engine: '0x695171F8FC059A3B1F3e8d7a201C0271aD436B77', collateral: ADDRESSES.robinhood.AMD }, // AMD
    { engine: '0xcAaC375E2d975359Bc5a8449eED9E281F359E234', collateral: ADDRESSES.robinhood.MU }, // MU
    { engine: '0xe1E9cdAfDB792dF85C497F3752263d674105b0b4', collateral: ADDRESSES.robinhood.TSLA }, // TSLA
    { engine: '0xEfCAaD33fb0E309eD021e2fe85342C2e58951b9F', collateral: ADDRESSES.robinhood.CASHCAT }, // CASHCAT
    { engine: '0x37DF02D0D721aB8a351333052535B2b7F1262F36', collateral: ADDRESSES.robinhood.AAPL }, // AAPL
    { engine: '0x8f4101368B25A5Ae2043891574BDDb8275572533', collateral: '0xe93237C50D904957Cf27E7B1133b510C669c2e74' }, // MSFT
    { engine: '0xD49B1AF2f2e7e6340e8f419dAccCe68Ebb9378CD', collateral: ADDRESSES.robinhood.GOOGL }, // GOOGL
    { engine: '0xD2157493950813849824Ba7f29d726d777037F2E', collateral: ADDRESSES.robinhood.AMZN }, // AMZN
    { engine: '0x74AbbC9724039B07527a611714b82aDfc19A2eD8', collateral: ADDRESSES.robinhood.META }, // META
    { engine: '0x73dB617B21b3E7Fd9056333902A1738463519DC8', collateral: ADDRESSES.robinhood.NVDA }, // NVDA
    { engine: '0xf2948B3De193934A0b45bc34C57ff5E25BcDA558', collateral: ADDRESSES.robinhood.AMD }, // AMD
    { engine: '0x067aC120ec0D6e879f4C40426385EA0Ac3d2Cd0A', collateral: ADDRESSES.robinhood.MU }, // MU
    { engine: '0xFA125B8406ed76E25962a20C340FE19bf41d3179', collateral: ADDRESSES.robinhood.TSLA }, // TSLA
    { engine: '0xee1f486Ea6827Cd9fB87c35629A05707FF13cc03', collateral: ADDRESSES.robinhood.CASHCAT }, // CASHCAT
    { engine: '0x79CB40DF1aD78d0395290431e1f42324900180FB', collateral: '0x411eFb0E7f985935DAec3D4C3ebaEa0d0AD7D89f' }, // SLV
    { engine: '0x128998305d895e2Eb4bF0F0AD0653a3F1D01762D', collateral: '0x411eFb0E7f985935DAec3D4C3ebaEa0d0AD7D89f' }, // SLV
    { engine: '0xBF838a4D081CD323a75135F55D8F6Bf531EDB273', collateral: '0x411eFb0E7f985935DAec3D4C3ebaEa0d0AD7D89f' }, // SLV
    { engine: '0x03A206E3E54ff3e570Bf144c79D05BDA1432a2de', collateral: '0x411eFb0E7f985935DAec3D4C3ebaEa0d0AD7D89f' }, // SLV
    { engine: '0xdF4B6A4Fea65deE443F1dDeD9935f5aeB3627f11', collateral: '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C' }, // SPY
    { engine: '0x4eACCE95247928487D500ad74A372D5bB607Cf03', collateral: '0xD5f3879160bc7c32ebb4dC785F8a4F505888de68' }, // QQQ
    { engine: '0x9c5bCa4278E3A8d464945A1113D0645d9203463c', collateral: ADDRESSES.robinhood.AAPL }, // AAPL
    { engine: '0x46d7e1a043A8a2fb4315FEa0AF1da8D498192F19', collateral: '0xe93237C50D904957Cf27E7B1133b510C669c2e74' }, // MSFT
    { engine: '0x9abd97c7fA668dc92d9C9d15dAf870CE8c79a4A8', collateral: ADDRESSES.robinhood.GOOGL }, // GOOGL
    { engine: '0x655e64DD4Dfdf5d79C1f92b5F524db4E296d2945', collateral: ADDRESSES.robinhood.AMZN }, // AMZN
    { engine: '0x70EfbaA4336F2b51A1360C6E2fdd6150bEe40b39', collateral: ADDRESSES.robinhood.META }, // META
    { engine: '0x6892b9C2777ad59ad3199EA5D0D54EEF725f5271', collateral: ADDRESSES.robinhood.NVDA }, // NVDA
    { engine: '0xa71072C88c75B355a530569FAE22a7729fBd553A', collateral: ADDRESSES.robinhood.AMD }, // AMD
    { engine: '0xe82750025Ea94ec9401658DCB6CB2b1c5F3cb925', collateral: ADDRESSES.robinhood.MU }, // MU
    { engine: '0xCc8dA6DD324e998660eA503E582aB9dEE8655820', collateral: ADDRESSES.robinhood.TSLA }, // TSLA
    { engine: '0x9023FB0cA32204EE4cCe39e3e664aaEF1cD0A418', collateral: '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C' }, // SPY
    { engine: '0x27979092F64883E6322262862e30F914d284c971', collateral: '0xD5f3879160bc7c32ebb4dC785F8a4F505888de68' }, // QQQ
    { engine: '0x8FeE2C05DC41765C4e3D550F1c33FAD6E679aA6a', collateral: '0x411eFb0E7f985935DAec3D4C3ebaEa0d0AD7D89f' }, // SLV
    { engine: '0xC29907317d8e78E9f6455F22577361b5184b449e', collateral: ADDRESSES.robinhood.CASHCAT }, // CASHCAT
  ],
  // Token P2P markets. V1/V2 custody open-offer cash and collateral at the market contract.
  p2pMarkets: [
    { address: '0xe548566e61439E6c95231FD42c9F601257E24A4d', collateral: ADDRESSES.robinhood.AAPL }, // v2
    { address: '0x0029D5302e23BD56924F6047b385E6Dda114D3f4', collateral: '0xe93237C50D904957Cf27E7B1133b510C669c2e74' }, // v2
    { address: '0x3fA22c7FD391D1FCf682dfa64cb73f688cD7076C', collateral: ADDRESSES.robinhood.GOOGL }, // v2
    { address: '0xc686015A9F64829A4015E66D174EAC1B58490c48', collateral: ADDRESSES.robinhood.AMZN }, // v2
    { address: '0x72dE275366E6579c2Da148e24Eef24a5143f14b8', collateral: ADDRESSES.robinhood.META }, // v2
    { address: '0xD21Ac17FB08b56788C2c94e010F5f33190254810', collateral: ADDRESSES.robinhood.NVDA }, // v2
    { address: '0x1119e475d9a5609423e0b7aF4B1CcD7ef2c21034', collateral: ADDRESSES.robinhood.AMD }, // v2
    { address: '0x1F10cf271f75a76E0698c9A02F20F88122891df2', collateral: ADDRESSES.robinhood.MU }, // v2
    { address: '0x2CEBccf207BFc929889dce41531eaBcf6A0cee11', collateral: ADDRESSES.robinhood.TSLA }, // v2
    { address: '0x0a4dd132f38345B4F134Cd660a9A513648F360f0', collateral: '0x411eFb0E7f985935DAec3D4C3ebaEa0d0AD7D89f' }, // v2
    { address: '0xCA632493fE346183243C359676356Ffb6D5aF37B', collateral: ADDRESSES.robinhood.CASHCAT }, // v2
    { address: '0x24718Dd2970bBD1aA58AFd05223ca247Ce33c1cA', collateral: ADDRESSES.robinhood.PONS }, // v2
    { address: '0xc79e3d2a66265c92e721def2162efdc21bdacfa7', collateral: '0x411eFb0E7f985935DAec3D4C3ebaEa0d0AD7D89f' }, // v1
    { address: '0x41a381b4B5A98B330d4482F8a7b1469C2F63496e', collateral: '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C' }, // v2
    { address: '0xed6f454080F32B3ff78F2bb048906E3dCC75f630', collateral: '0xD5f3879160bc7c32ebb4dC785F8a4F505888de68' }, // v2
    { address: '0x38e0deF753eCa9c98DEa1366eB48471866A4F610', collateral: '0xC9a981FEE1F9DEc688bb123ccDeCc63D0deBFC4e' }, // v2
    { address: '0xAbe2e6019091f159835Bbc39529CDd1484befc6F', collateral: '0x6330D8C3178a418788dF01a47479c0ce7CCF450b' }, // v2
    { address: '0x621fC38DbAf5B7e6DF0e43ccB1bDCEDbB246c57F', collateral: '0x894E1EC2D74FFE5AEF8Dc8A9e84686acCB964F2A' }, // v2
    { address: '0xf9379ab2c2ae4C2eb02B55412d7c87D9077A3A39', collateral: '0xE0444EF8BF4eD74f74FD73686e2ddF4C1c5591E8' }, // v2
    { address: '0x703F9797cb31294ba583FfFB748A26f946E75515', collateral: '0x56910D4409F3a0C78C64DD8D0545FF0705389870' }, // v2
  ],
  // V3 markets custody in per-offer vaults enumerated via nextOfferId / vaults(id).
  p2pV3Markets: [
    { address: '0xbcA2c4E897C7A988B0Aead0FBE92BCB87e190d25', collateral: ADDRESSES.robinhood.AAPL },
    { address: '0x0855f435bE9Fd3c1f42Bd773a130A5D61b0Cb6EB', collateral: '0xe93237C50D904957Cf27E7B1133b510C669c2e74' },
    { address: '0x34A9a43A5FF778B4015E24A16E963A0B5E6Cfd93', collateral: ADDRESSES.robinhood.GOOGL },
    { address: '0x69c13ce4b28b936340Ce900fD35Ee5c799b7F7EC', collateral: ADDRESSES.robinhood.AMZN },
    { address: '0x781E21C6156f817aEFce9Fd868DdBc1aD226B23a', collateral: ADDRESSES.robinhood.META },
    { address: '0xC373430223CF4559530D846E3aa46268FeC05851', collateral: ADDRESSES.robinhood.NVDA },
    { address: '0xA5059918bd0c4107E0EF6E634f7aee1BAF93940f', collateral: ADDRESSES.robinhood.AMD },
    { address: '0x7945070E9Be31EE0fF192BD2F96B5bF1f417F0E2', collateral: ADDRESSES.robinhood.MU },
    { address: '0x8467cC58E4D3Fa3F48d6A522E2D119C2157Be6F2', collateral: ADDRESSES.robinhood.TSLA },
    { address: '0xA4de9578B8E94377420BF30e53D7dB7DBc8427B8', collateral: '0x411eFb0E7f985935DAec3D4C3ebaEa0d0AD7D89f' },
    { address: '0x36dD2b90e8e8541CcAB1258465732c4e961A9657', collateral: ADDRESSES.robinhood.CASHCAT },
    { address: '0x17c1B3CaBc49a196Ec39B7BA8409226eDe756A20', collateral: ADDRESSES.robinhood.PONS },
    { address: '0x9C1eC6c0C5Ff43307EaA58408ff9674A5D4d7D09', collateral: '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C' },
    { address: '0xd41B87Ca091cbbf35dF36Aad9153d94248003163', collateral: '0xD5f3879160bc7c32ebb4dC785F8a4F505888de68' },
    { address: '0x795a763dD618f0A9868898143285B34AB0128DA8', collateral: '0xC9a981FEE1F9DEc688bb123ccDeCc63D0deBFC4e' },
    { address: '0x24721aA5Aef309a984552ec8aF0d3b6827d51424', collateral: '0x6330D8C3178a418788dF01a47479c0ce7CCF450b' },
    { address: '0xFf8908Fa2fDB92915a91B380769D24D119937145', collateral: '0x894E1EC2D74FFE5AEF8Dc8A9e84686acCB964F2A' },
    { address: '0xd47A99bE3f5217eC525F3275DF298727CdaaC38B', collateral: '0xE0444EF8BF4eD74f74FD73686e2ddF4C1c5591E8' },
    { address: '0xd4F06D7Fb0fA388394ae010E59690d3B890A8451', collateral: '0x56910D4409F3a0C78C64DD8D0545FF0705389870' },
  ],
}
