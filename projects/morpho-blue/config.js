const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  ethereum: {
    morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    blackList: [
      "0x8413D2a624A9fA8b6D3eC7b22CF7F62E55D6Bc83",
      ADDRESSES.base.USDC,
      ADDRESSES.optimism.WSTETH,
      '0x84b78bc998e4b1a63f2cf9ebfe76c55fc96a5a9b',
      '0x52c66b5e7f8fde20843de900c5c8b4b0f23708a0' // AZND token used to artificially inflate Morpho total deposit metric
    ],
    fromBlock: 18883124,
    blacklistedMarketIds: [
      "0x1dca6989b0d2b0a546530b3a739e91402eee2e1536a2d3ded4f5ce589a9cd1c2",

      // bad debt due to resolv hack
      "0xd9e34b1eed46d123ac1b69b224de1881dbc88798bc7b70f504920f62f58f28cc",
      "0xe1b65304edd8ceaea9b629df4c3c926a37d1216e27900505c04f14b2ed279f33",
      "0x8e7cc042d739a365c43d0a52d5f24160fa7ae9b7e7c9a479bd02a56041d4cf77",
      "0xcc39b6c92fd03ac608b9239618db8b80a4a2034b0450bdf47b404229571312da",
      "0x1cfdc0154ae6b9f1887a8250f2582d55606e1a2008e65108fb83dd50a928593e",

      "0x0f9563442d64ab3bd3bcb27058db0b0d4046a4c46f0acd811dacae9551d2b129", // sdeUSD/USDC (91.5% LLTV) bad debt from sdeUSD exploit (Nov 2025)
      "0x8eaf7b29f02ba8d8c1d7aeb587403dcb16e2e943e4e2f5f94b0963c2386406c9", // PAXG market
      "0x11db9f2c7bda8c2af6a6a72db18aa5eb9290cb99cf75a3c0abacf1b84b8eaf77", // amphrETH market
      "0x4b86442549b52826e0fc11770ec5154450cb3c5c14dc751a761d81dcfbe7a7b2", // RLP market
      "0xbd1ad3b968f5f0552dbd8cf1989a62881407c5cccf9e49fb3657c8731caf0c1f", // deUSD market
      "0xfd0d72a4f0469598b566b1bc5fe64835f828f90b1fb7d746148c086164cd4cc2", // AZND/USDC market, 0 liquidity and 1 borrower
      "0x23a7d0ff682b323363fb8ba58327ed87001f6306e09b7fd7413bbe4698e749c8", // msY/USDC market
    ],
  },
  base: {
    morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    blackList: ["0x6ee1955afb64146b126162b4ff018db1eb8f08c3", '0xda1c2c3c8fad503662e41e324fc644dc2c5e0ccd', '0x46415998764c29ab2a25cbea6254146d50d22687', '0x5e331e9ae6e1a5d375f699811736527222a9db15', '0x2dc205f24bcb6b311e5cdf0745b0741648aebd3d', '0xadcdd085ad2887758255090589f72237bdd33d8a', '0xcb327b99ff831bf8223cced12b1338ff3aa322fa', '0xadcdd085ad2887758255090589f72237bdd33d8e', '0x4bcaf180df5b13c0441fe41a66e9638a2a410c6d'], // HERMES token used to artificially inflate Morpho total deposit metric
    fromBlock: 13977148,
    blacklistedMarketIds: [
      '0xff0f2bd52ca786a4f8149f96622885e880222d8bed12bbbf5950296be8d03f89', // bad debt due to resolv hack
      '0xe1986e80099257c65dd18091ec7e34752ae2336870a5649f20c450c9c4931fb8', // HERMES market
      '0xa4ec527128b425ee3fcb7f60eca37677b63b3d003345ec2a72ef6a2e72da53fc', // RSS/USDC (77% LLTV) market, single supplier looping against self-issued RSS collateral
      '0x41c08085ddcfd1dc1c5eb82d7dc031593d1a1a831958380e8b60469c45bf7d88', // RSS/USDC (77% LLTV) market, single supplier looping against self-issued RSS collateral
    ]
  },
  arbitrum: {
    morphoBlue: "0x6c247b1F6182318877311737BaC0844bAa518F5e",
    blackList: [
      "0xf8b3fa720a9cd8abeed5a81f11f80cd8f93e6b57",
      "0x010700ab046dd8e92b0e3587842080df36364ed3", // K token inflated by Kinto exploit
      '0x57587e47a0af9d1bb93c0d4b3df671b053ab4366', // GLVT token - verify backing
    ],
    fromBlock: 296446593,
    blacklistedMarketIds: [
      "0xfdb8221edcae73f73485d55c30e706906114bc2ff4634870c5c57e8fb83eae6a", // K/USDC bad debt from Kinto exploit
      "0x9e90aec7d768403dacc9dd0d8320307fda3f980eed4df43e3e52168a1c667709", // xUSD market
      "0xc7670063349ac19dfa324ead7bd7da2985ae931e1b09fb0e31b62c6486b730bd", // RLP market
    ],
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
    blackList: ["0x45d4a31854f09a257ff6b3c3ae0d0f479a898da9", "0xaffcf1312772583d9d0b9f6e68f5767154b29dfd", "0xa39c45a857bb82df069f63ca8741a02ebe7e9719", "0xc69e948a9a5c123704580c46332f90cff1cb215b", "0x316c0b5cd67aa7c2da7a576d3724e3763981d08f", "0xd59a2e7d5110dc379910925aa0472a13e09a093e", "0xc7a357293a35ce4c8d7f2000571043313987aab7", "0xf14c4fd60765e36d63f6c8b8161bd41ba995fb44", "0x338a4ef6953b36e67ccf7cffe50ebc74b1d64387", "0x12fd05a9306affc946cb13301d88a102400544d2", "0x8a874eb137d99415bad95c5d4399bc691849d02f", "0x365ab7828ea541c1d6e30472a1a1e7d07600a6bd", "0xc7056597f3a816202486b5082b3291a2023c9633", "0x2faaa34f387e6485671faeda7c021ee6af961d35"],
    fromBlock: 66931042,
  },
  scroll: {
    morphoBlue: "0x2d012EdbAdc37eDc2BC62791B666f9193FDF5a55",
    fromBlock: 12842868,
  },
  wc: {
    morphoBlue: "0xE741BC7c34758b4caE05062794E8Ae24978AF432",
    fromBlock: 9025669,
    blacklistedMarketIds: [
      "0x5a96ea60ddb8ece11b0dd1176f05bbc44ec92197ba206adb086db559146cc964", // sdeUSD market
    ],
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
    blackList: ['0x66a1e37c9b0eaddca17d3662d6c05f4decf3e110'],
    fromBlock: 1988429,
  },
  plume_mainnet: {
    morphoBlue: "0x42b18785CE0Aed7BF7Ca43a39471ED4C0A3e0bB5",
    fromBlock: 765994,
    blacklistedMarketIds: [
      "0x82e7ab8ccabaac59b5f397507ed031ebf19a9a5b2657c00c93bc2423cd0a890d",
    ],
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
    blackList: ['0x4917a5ec9fcb5e10f47cbb197abe6ab63be81fe8'], // AZND token used to artificially inflate Morpho total deposit metric
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
  },/* still in private mainnet
  arc: {
    morphoBlue: "0x34CD04070dD72b14E241112F6d83812Df5Af7fCD",
    fromBlock: 1,
  },
  */
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
  morph: {
    morphoBlue: "0xAd10d07901Dc3195c3cb5e78E061F4EA8D9B4905",
    fromBlock: 23180020,
  }
}

module.exports = { config }
