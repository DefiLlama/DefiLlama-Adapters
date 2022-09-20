const { unknownTombs } = require("../helper/unknownTokens")

const token = "0x49fB98F9b4a3183Cd88e7a115144fdf00fa6fB95"
const rewardPool = ["0x44B4a1e8f34Bb52ed39854aD218FF94D2D5b4800","0x14103f4Fc36daCeaCDE4c5313a2b1a462e00B1e8"]
const lps = Object.values({
    'LION-USDC-LP': '0xf2059ed015ec4ecc80f902d9fdbcd2a227bfe037',
    'TIGER-USDC-LP': '0xf6464c80448d6ec4deb7e8e5ec95b8eb768fbf69',
    'BEAR-WBTC-LP': '0x3d9e539fa44b970605658e25d18f816ce78c4007',
})

module.exports = unknownTombs({
  lps,
  token,
  shares: [
    '0xD6597AA36DD90d7fCcBd7B8A228F2d5CdC88eAd0', //Tiger
    '0xaa22aebd60c9eb653a0ae0cb8b7367087a9b5dba', //Bear
  ],
  rewardPool,
  masonry: [
    '0x05CaB739FDc0A4CE0642604c78F307C6c543cD6d',
  ],
  chain: 'cronos',
  coreAssets: ["0xc21223249CA28397B4B6541dfFaEcC539BfF0c59","0x062e66477faf219f25d27dced647bf57c3107d52"]
  useDefaultCoreAssets: false,
})
