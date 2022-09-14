const { unknownTombs } = require("../helper/unknownTokens")

const token = "0x49fB98F9b4a3183Cd88e7a115144fdf00fa6fB95"
const rewardPool = "0x44B4a1e8f34Bb52ed39854aD218FF94D2D5b4800"
const lps = Object.values({
    'LION-SVN-LP': '0xD440433dAA33b3e3f2b5421046EAf84bEe6F40D0',
    'TIGER-SVN-LP': '0xaDeC6aaAa0765472EE9eBe524BD3454Fd733BAB9',
    'USDC-SVN-LP': '0xe7bEEC1046007BBCf7394076C654640F32456453',
    'USDC-MMF-LP': '0x722f19bd9a1e5ba97b3020c6028c279d27e4293c',
    'BEAR-MSHARE-LP': '0xcC091518302CBca55897Fc370e722b01D57D397a',
    'MMF-SVN-LP': '0xB6E1705BfAFcf1efEE83C135C0F0210653bAB8F0',
    'LION-USDC-MMF-LP': '0x32aaaaadecbb11c474ddbd4c934523bcfecea8dd',
    'TIGER-USDC-MMF-LP': '0x4f61a3104eb671bd501b78fb49ed713803609bc0',
    'BEAR-WBTC-MMF-LP': '0x8cc728a1a35665e000b303eda9c1d774445e3d12',
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
  useDefaultCoreAssets: true,
})
