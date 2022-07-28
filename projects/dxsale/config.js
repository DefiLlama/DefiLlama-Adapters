const LockersV3 = {
  empty: ['0xEb3a9C56d963b971d320f889bE2fb8B59853e449'],
  bsc: [
    "0xEb3a9C56d963b971d320f889bE2fb8B59853e449",
    "0x8655E5c4D701186D16765d1CDcef6D5287E4679a",
    "0x5b5e94485c9628793B01A38762921Dc37B6829b6",
    // "0x2D045410f002A95EFcEE67759A92518fA3FcE677",
    // "0x81E0eF68e103Ee65002d3Cf766240eD1c070334d",
  ],
  ethereum: [
    "0x1Ba00C14F9E8D1113028a14507F1394Dc9310fbD",
    "0xe74083baFE69cd74519C6a40a3Ad0723BD360BDD",
    "0xc68C522682614A9F1D336f756c0C0D71352925D3",
    // "0x916a8C33B784f6399Ce8b7aff59d4AAD29386B8E",
    // "0xBae21D4247dd3818f720ab4210C095E84e980D96",
  ],
  arbitrum: [
    "0x51f411d40641475576622c8fba77F1e917e96Df4",
    // "0xdf17aC098Fa81373625e102061844C02ECCEc645",
  ],
  celo: [
    "0xC7065e692D2caCF7173C7BC08c6849eb9Ef48b38",
    // "0xdf17aC098Fa81373625e102061844C02ECCEc645",
  ],
  kucoin: [
    // "0x3052b62d39624f341D44b195D2E4b865f074B656",
    "0xd5071536d1A2AfF6dB130917B4c1FA7b8Daf47ff",
    "0x1C8aB27b538b5e43c151460cBc6D271cB9EeE4aF",
    "0x020B4f43BD0fb82cFe9427F81E0E5FCCE433f3f5",
  ],
  harmony: [
    "0xd5F1593D585cbAC2d5bCae2dbae4fc159375C6dD",
    "0xB3C0Bc5D284c9f01a0d4c4eab8546D4D124612cD",
    "0x4B170Bb56032Ca068fF0Ee03943a9B9bc1554C9A",
    // "0xadC5caC1E3CD46Fe8d5b98DB4Ea6eE241a19dCEE",
    // "0x13455DeE5199691f11ffBb4AAf59Af56F23b95aE",
  ],
  avax: [
    "0x69275e94cC431e380EebCbda6FB8e19f931cD359",
    "0x77D054b8e61A141CE51fc9Cc3E9E2C3B79F57809",
    // "0xadC5caC1E3CD46Fe8d5b98DB4Ea6eE241a19dCEE",
    // "0x10f485B855bE8E7D377fbE60E5D5676d88817b95",
  ],
  xdai: [
    // "0x77D054b8e61A141CE51fc9Cc3E9E2C3B79F57809",
    "0x832CcF861059Cb352515E89Cc54F1b13C6620D37",
    "0xeA8d06F70E1a5BD1Bf6cE927e62C8E370f5aAfC1",
    // "0x63d20Bf9Aa36b8bE580b19B024dD8b62a9f11F3b",
    // "0x554d523a54471F12dDE2152A7F33E159404d199e",
  ],
  fantom: [
    "0x318Aa10323Bb8DDD163AdB61F0C54Cfa85b4132e",
    "0xc1E3f48e23D899A326C31df6A2850457F50710F8",
    "0x832CcF861059Cb352515E89Cc54F1b13C6620D37",
    // "0x1C8aB27b538b5e43c151460cBc6D271cB9EeE4aF",
    // "0xb5566a206a89bd9C004230e6F6ac7335C77043cd",
  ],
  polygon: [
    "0xEb3a9C56d963b971d320f889bE2fb8B59853e449",
    "0x6FCC2e4Efb4E05DdfC2154AbE209356d5A687666",
    "0x036063706396Ad5Dc49241451E955fbE05899cDe",
    // "0x2D045410f002A95EFcEE67759A92518fA3FcE677",
    // "0xb5566a206a89bd9C004230e6F6ac7335C77043cd",
  ],
};

const LockerV33 = {
  bsc: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  ethereum: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  arbitrum: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  celo: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  kucoin: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  harmony: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  avax: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  xdai: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  fantom: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  polygon: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  okexchain: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  cronos: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },

  moonriver: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: [
      // "0xFEE2A3f4329e9A1828F46927bD424DB2C1624985",
    ],
  },

  heco: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },
  smartbch: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0xFEE2A3f4329e9A1828F46927bD424DB2C1624985"],
  },
  milkomeda: {
    tokenStorage: ["0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F"],
    lpStorage: ["0x6E573D464416a81A9F82207F1dFD6a42e4b21066"],
  },
};

const protocolPairs = {
  sale_BNB: "0x61cA6ae520b9c9Cfab0B66aFaD78FF7127bA37B6",
  sale_ETH: "0xAAe5f80BaC0c7fA0cAd6c2481771a3B17aF21455",
  sale_HT: "0x4A677fF39B731861AfBA6051b95755B6704FB5eA",
  sale_MATIC_sushi: "0x5a2bA689663fD35eC111676294055bd9FA47fdE8",
  sale_MATIC_quick: "0xf2f46CFC363ff5554801Eb38944148cF3D40d82F",
};

const tokens = {
  sale_BSC: "0x04F73A09e2eb410205BE256054794fB452f0D245",
  sale_ETH: "0xf063fe1ab7a291c5d06a86e14730b00bf24cb589",
  sale_Heco: "0x2665375a48A76BB49F6b375844eB88390840C0B8",
  sale_MATIC: "0x8f6196901a4a153d8ee8f3fa779a042f6092d908",
};

const bscArchives = {
  chain: "bsc",
  locks: LockersV3.bsc,
  storageTokenLocks: LockerV33.bsc.tokenStorage,
  storageLiquidityLocks: LockerV33.bsc.lpStorage,
  coreAssets: [
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // wbnb
    '0xe9e7cea3dedca5984780bafc599bd69add087d56', // busd
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
    '0x55d398326f99059ff775485246999027b3197955', // USDT
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // ETH
  ],
};

const ethereumArchives = {
  chain: "ethereum",
  locks: LockersV3.ethereum,
  storageTokenLocks: LockerV33.ethereum.tokenStorage,
  storageLiquidityLocks: LockerV33.ethereum.lpStorage,
  coreAssets: [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  ]
};

const polygonArchives = {
  chain: "polygon",
  locks: LockersV3.polygon,
  storageTokenLocks: LockerV33.polygon.tokenStorage,
  storageLiquidityLocks: LockerV33.polygon.lpStorage,
  coreAssets: [
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
  ],
};

const arbitrumArchives = {
  chain: "arbitrum",
  locks: LockersV3.arbitrum,
  storageTokenLocks: LockerV33.arbitrum.tokenStorage,
  storageLiquidityLocks: LockerV33.arbitrum.lpStorage,
  coreAssets: [
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // ETH
    "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", // wbtc
    "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // usdc
    "0xf97f4df75117a78c1a5a0dbb814af92458539fb4", // link
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // usdt
  ]
};

const celoArchives = {
  chain: "celo",
  locks: LockersV3.celo,
  storageTokenLocks: LockerV33.celo.tokenStorage,
  storageLiquidityLocks: LockerV33.celo.lpStorage,
  coreAssets: [
    '0x471EcE3750Da237f93B8E339c536989b8978a438', // celo
  ]
};

const kucoinArchives = {
  chain: "kcc",
  locks: LockersV3.kucoin,
  storageTokenLocks: LockerV33.kucoin.tokenStorage,
  storageLiquidityLocks: LockerV33.kucoin.lpStorage,
  coreAssets: [
    '0x4446fc4eb47f2f6586f9faab68b3498f86c07521', // wkcs
  ]
};

const harmonyArchives = {
  chain: "harmony",
  locks: LockersV3.harmony,
  storageTokenLocks: LockerV33.harmony.tokenStorage,
  storageLiquidityLocks: LockerV33.harmony.lpStorage,
  coreAssets: [
    '0x6983D1E6DEf3690C4d616b13597A09e6193EA013', // WETH
    '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a', // WHARMONY
    '0x985458e523db3d53125813ed68c274899e9dfab4', // USDC
    '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f', // USDT
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
  ],
};

const avaxArchives = {
  chain: "avax",
  locks: LockersV3.avax,
  storageTokenLocks: LockerV33.avax.tokenStorage,
  storageLiquidityLocks: LockerV33.avax.lpStorage,
  coreAssets: [
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // wavax
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // USDC
    '0xc7198437980c041c805a1edcba50c1ce5db95118', // USDT
  ],
};

const xdaiArchives = {
  chain: "xdai",
  locks: LockersV3.xdai,
  storageTokenLocks: LockerV33.xdai.tokenStorage,
  storageLiquidityLocks: LockerV33.xdai.lpStorage,
  coreAssets: [
    '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', // WXDAI
    '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', // USDC
  ]
};

const fantomArchives = {
  chain: "fantom",
  locks: LockersV3.fantom,
  storageTokenLocks: LockerV33.fantom.tokenStorage,
  storageLiquidityLocks: LockerV33.fantom.lpStorage,
  coreAssets: [
    '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // wftm
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75', // USDC
    '0x049d68029688eabf473097a2fc38ef61633a3c7a', // USDT
    '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e', // DAI
  ],
};

const hecoArchives = {
  chain: "heco",
  locks: [],
  storageTokenLocks: LockerV33.heco.tokenStorage,
  storageLiquidityLocks: LockerV33.heco.lpStorage,
  coreAssets: [
    '0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f', // wheco
  ],
};

const okexchainArchives = {
  chain: "okexchain",
  locks: [],
  storageTokenLocks: LockerV33.okexchain.tokenStorage,
  storageLiquidityLocks: LockerV33.okexchain.lpStorage,
  coreAssets: [
    '0x382bb369d343125bfb2117af9c149795c6c65c50', // tether
    "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85", // usdc
    "0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15", // wokt
  ]
};

const cronosArchives = {
  chain: "cronos",
  locks: [],
  storageTokenLocks: LockerV33.cronos.tokenStorage,
  storageLiquidityLocks: LockerV33.cronos.lpStorage,
  coreAssets: [
    '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23'
  ]
};

const moonriverArchives = {
  chain: "moonriver",
  locks: [],
  storageTokenLocks: LockerV33.moonriver.tokenStorage,
  storageLiquidityLocks: LockerV33.moonriver.lpStorage,
  coreAssets: [
    '0xf50225a84382c74CbdeA10b0c176f71fc3DE0C4d', // moonriver
    "0xb44a9b6905af7c801311e8f4e76932ee959c663c", // usdt
    "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", // usdc
    "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", // eth
  ]
};

const smartbchArchives = {
  chain: "smartbch",
  locks: [],
  storageTokenLocks: LockerV33.smartbch.tokenStorage,
  storageLiquidityLocks: LockerV33.smartbch.lpStorage,
  coreAssets: [
    '0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04', // smartbch
  ]
};

const milkomedaArchives = {
  chain: "milkomeda",
  locks: [],
  storageTokenLocks: LockerV33.milkomeda.tokenStorage,
  storageLiquidityLocks: LockerV33.milkomeda.lpStorage,
  coreAssets: [
    '0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9',
    '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
    '0x8d50a024B2F5593605d3cE8183Ca8969226Fcbf8',
    '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
    '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283'
  ],
};

module.exports = {
  milkomedaArchives,
  smartbchArchives,
  moonriverArchives,
  cronosArchives,
  okexchainArchives,
  hecoArchives,
  polygonArchives,
  bscArchives,
  ethereumArchives,
  arbitrumArchives,
  celoArchives,
  kucoinArchives,
  harmonyArchives,
  avaxArchives,
  xdaiArchives,
  fantomArchives,
};
