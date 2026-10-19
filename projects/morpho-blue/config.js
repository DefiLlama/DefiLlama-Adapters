const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  ethereum: {
    morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    fromBlock: 18883124,
  },
  base: {
    morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    fromBlock: 13977148,
  },
  arbitrum: {
    morphoBlue: "0x6c247b1F6182318877311737BaC0844bAa518F5e",
    fromBlock: 296446593,
  },
  fraxtal: {
    morphoBlue: "0xa6030627d724bA78a59aCf43Be7550b4C5a0653b",
    fromBlock: 15317931,
  },
  ink: {
    morphoBlue: "0x857f3EefE8cbda3Bc49367C996cd664A880d3042",
    fromBlock: 4078776,
  },
  optimism: {
    morphoBlue: "0xce95AfbB8EA029495c66020883F87aaE8864AF92",
    fromBlock: 130770075,
  },
  polygon: {
    morphoBlue: "0x1bF0c2541F820E775182832f06c0B7Fc27A25f67",
    fromBlock: 66931042,
  },
  scroll: {
    morphoBlue: "0x2d012EdbAdc37eDc2BC62791B666f9193FDF5a55",
    fromBlock: 12842868,
  },
  wc: {
    morphoBlue: "0xE741BC7c34758b4caE05062794E8Ae24978AF432",
    fromBlock: 9025669,
  },
  mode: {
    morphoBlue: "0xd85cE6BD68487E0AaFb0858FDE1Cd18c76840564",
    fromBlock: 19983370,
  },
  corn: {
    morphoBlue: "0xc2B1E031540e3F3271C5F3819F0cC7479a8DdD90",
    fromBlock: 251401,
  },
  hemi: {
    morphoBlue: "0xa4Ca2c2e25b97DA19879201bA49422bc6f181f42",
    fromBlock: 1188872,
  },
  sonic: {
    morphoBlue: "0xd6c916eB7542D0Ad3f18AEd0FCBD50C582cfa95f",
    fromBlock: 9100931,
  },
  unichain: {
    morphoBlue: "0x8f5ae9CddB9f68de460C77730b018Ae7E04a140A",
    fromBlock: 9139027,
  },
  // flame: {
  //   morphoBlue: "0x63971484590b054b6Abc4FEe9F31BC6F68CfeC04", // flame blockchain down from last time I check
  //   fromBlock: 5991116,
  // },
  // basecamp:{
  //   morphoBlue: "0xc7CAd9B1377Eb8103397Cb07Cb5c4f03eb2eBEa8",
  //   fromBlock: 4804080,
  //   blackList: ['0x68d6024e5168f16d3453a23b36f393a559be7aef'],
  // },
  hyperliquid: {
    morphoBlue: "0x68e37dE8d93d3496ae143F2E900490f6280C57cD",
    fromBlock: 1988429,
  },
  plume_mainnet: {
    morphoBlue: "0x42b18785CE0Aed7BF7Ca43a39471ED4C0A3e0bB5",
    fromBlock: 765994,
  },
  lisk: {
    morphoBlue: "0x00cD58DEEbd7A2F1C55dAec715faF8aed5b27BF8",
    fromBlock: 15731231,
  },
  soneium: {
    morphoBlue: "0xE75Fc5eA6e74B824954349Ca351eb4e671ADA53a",
    fromBlock: 6440817,
  },
  katana: {
    morphoBlue: "0xD50F2DffFd62f94Ee4AEd9ca05C61d0753268aBc",
    fromBlock: 2741069,
    // added a hack server-side to count vb token tvls only on katana but not global
    // blackList: [ADDRESSES.katana.VB_USDT, ADDRESSES.katana.VB_USDC, ADDRESSES.katana.VB_WBTC, ADDRESSES.katana.VB_WETH]
  },
  tac: {
    morphoBlue: "0x918B9F2E4B44E20c6423105BB6cCEB71473aD35c",
    fromBlock: 1308542,
  },
  zircuit: {
    morphoBlue: "0xA902A365Fe10B4a94339B5A2Dc64F60c1486a5c8",
    fromBlock: 14640172,
  },
  abstract: {
    morphoBlue: "0xc85CE8ffdA27b646D269516B8d0Fa6ec2E958B55",
    fromBlock: 13947713,
  },
  btr: {
    morphoBlue: "0xaea7eff1bd3c875c18ef50f0387892df181431c6",
    fromBlock: 13516997,
  },
  bsc: {
    morphoBlue: "0x01b0Bd309AA75547f7a37Ad7B1219A898E67a83a",
    fromBlock: 54344680,
  },
  etlk: {
    morphoBlue: "0xbCE7364E63C3B13C73E9977a83c9704E2aCa876e",
    fromBlock: 21047448,
  },
  xdai: {
    morphoBlue: "0xB74D4dd451E250bC325AFF0556D717e4E2351c66",
    fromBlock: 42201689,
  },
  sei: {
    morphoBlue: "0xc9cDAc20FCeAAF616f7EB0bb6Cd2c69dcfa9094c",
    fromBlock: 166036723,
    onlyUseExistingCache: true,
  },
  btnx: {
    morphoBlue: "0x8183d41556Be257fc7aAa4A48396168C8eF2bEAD",
    fromBlock: 450759,
  },
  monad: {
    morphoBlue: "0xD5D960E8C380B724a48AC59E2DfF1b2CB4a1eAee",
    fromBlock: 31907457,
  },
  stable: {
    morphoBlue: "0xa40103088A899514E3fe474cD3cc5bf811b1102e",
    fromBlock: 2348260,
  },
  linea: {
    morphoBlue: "0x6B0D716aC0A45536172308e08fC2C40387262c9F",
    fromBlock: 25072608,
  },
  flare: {
    morphoBlue: "0xF4346F5132e810f80a28487a79c7559d9797E8B0",
    fromBlock: 52378788,
  },
  citrea: {
    morphoBlue: "0x99D31FEcc885204b4136ea5D2ef2a37F36E3AeB8",
    fromBlock: 2528230,
  },
  celo: {
    morphoBlue: "0xd24ECdD8C1e0E57a4E26B1a7bbeAa3e95466A569",
    fromBlock: 40249329,
  },
  tempo: {
    morphoBlue: "0x10EE9AAC980A180dd4DcFc96C746d60B0EA88f97",
    fromBlock: 12653218,
  },
  klaytn: {
    morphoBlue: "0xa8beebdca34d83c697c302a0594f3c41f3994cd2",
    fromBlock: 208021118,
  },
  arc: {
    morphoBlue: "0x34CD04070dD72b14E241112F6d83812Df5Af7fCD",
    fromBlock: 1946500,
  },
  "0g": {
    morphoBlue: "0x9CDD13a2212D94C4f12190cA30783B743E83C89e",
    fromBlock: 7526486,
  },
  robinhood: {
    morphoBlue: '0x9D53d5E3bd5E8d4Cbfa6DB1ca238AEA02E651010',
    fromBlock: 286,
  },
  megaeth: {
    morphoBlue: '0x18120312A7cf44DcfEc6dCe5632a431579ED9100',
    fromBlock: 18930057,
  },
  xdc: {
    morphoBlue: "0xEa49B0fE898aF913A3826F9f462eE2cDcb854fD9",
    fromBlock: 101757515,
  },
  pharos: {
    morphoBlue: "0x18573fA18fd17dDfD790B4a5B5b2977aad3b4Efb",
    fromBlock: 4202147,
  },
  avax: {
    morphoBlue: "0x895383274303AA19fe978AFB4Ac55C7f094f982C",
    fromBlock: 75313888,
  },
  rise: {
    morphoBlue: "0x363D2Ba422Db2552752f2EB10b419f0Eb5defD31",
    fromBlock: 6149533,
  },
  morph: {
    morphoBlue: "0xAd10d07901Dc3195c3cb5e78E061F4EA8D9B4905",
    fromBlock: 23180020,
  }
}

module.exports = { config }
