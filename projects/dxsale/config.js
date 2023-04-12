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
  bitgert: {
    tokenStorage: ["0x5AB541B972Acab91f0E5E7d30fCB4fe8e81b9Fa7"],
    lpStorage: ["0x16AAF57c5b3170a143A6A2DDfe897e8a2bDd8FD1"],
  },
  dexit: {
    tokenStorage: ["0x17e8c87d4de42fc143507B7c45Da2e6F2af7F24F"],
    lpStorage: ["0x0dDdD88aff5b7082BEf86923cf19BAd1ffb4EC8C"],
  },
  coreDao: {
    tokenStorage: ["0x17e8c87d4de42fc143507B7c45Da2e6F2af7F24F"],
    lpStorage: ["0x0dDdD88aff5b7082BEf86923cf19BAd1ffb4EC8C"],
  },
  doge: {
    tokenStorage: ["0x17e8c87d4de42fc143507B7c45Da2e6F2af7F24F"],
    lpStorage: ["0x0dDdD88aff5b7082BEf86923cf19BAd1ffb4EC8C"],
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
};

const ethereumArchives = {
  chain: "ethereum",
  locks: LockersV3.ethereum,
  storageTokenLocks: LockerV33.ethereum.tokenStorage,
  storageLiquidityLocks: LockerV33.ethereum.lpStorage,
};

const polygonArchives = {
  chain: "polygon",
  locks: LockersV3.polygon,
  storageTokenLocks: LockerV33.polygon.tokenStorage,
  storageLiquidityLocks: LockerV33.polygon.lpStorage,
};

const arbitrumArchives = {
  chain: "arbitrum",
  locks: LockersV3.arbitrum,
  storageTokenLocks: LockerV33.arbitrum.tokenStorage,
  storageLiquidityLocks: LockerV33.arbitrum.lpStorage,
};

const celoArchives = {
  chain: "celo",
  locks: LockersV3.celo,
  storageTokenLocks: LockerV33.celo.tokenStorage,
  storageLiquidityLocks: LockerV33.celo.lpStorage,
};

const kucoinArchives = {
  chain: "kcc",
  locks: LockersV3.kucoin,
  storageTokenLocks: LockerV33.kucoin.tokenStorage,
  storageLiquidityLocks: LockerV33.kucoin.lpStorage,
};

const harmonyArchives = {
  chain: "harmony",
  locks: LockersV3.harmony,
  storageTokenLocks: LockerV33.harmony.tokenStorage,
  storageLiquidityLocks: LockerV33.harmony.lpStorage,
};

const avaxArchives = {
  chain: "avax",
  locks: LockersV3.avax,
  storageTokenLocks: LockerV33.avax.tokenStorage,
  storageLiquidityLocks: LockerV33.avax.lpStorage,
};

const xdaiArchives = {
  chain: "xdai",
  locks: LockersV3.xdai,
  storageTokenLocks: LockerV33.xdai.tokenStorage,
  storageLiquidityLocks: LockerV33.xdai.lpStorage,
};

const fantomArchives = {
  chain: "fantom",
  locks: LockersV3.fantom,
  storageTokenLocks: LockerV33.fantom.tokenStorage,
  storageLiquidityLocks: LockerV33.fantom.lpStorage,
};

const hecoArchives = {
  chain: "heco",
  locks: [],
  storageTokenLocks: LockerV33.heco.tokenStorage,
  storageLiquidityLocks: LockerV33.heco.lpStorage,
};

const okexchainArchives = {
  chain: "okexchain",
  locks: [],
  storageTokenLocks: LockerV33.okexchain.tokenStorage,
  storageLiquidityLocks: LockerV33.okexchain.lpStorage,
};

const cronosArchives = {
  chain: "cronos",
  locks: [],
  storageTokenLocks: LockerV33.cronos.tokenStorage,
  storageLiquidityLocks: LockerV33.cronos.lpStorage,
};

const moonriverArchives = {
  chain: "moonriver",
  locks: [],
  storageTokenLocks: LockerV33.moonriver.tokenStorage,
  storageLiquidityLocks: LockerV33.moonriver.lpStorage,
};

const smartbchArchives = {
  chain: "smartbch",
  locks: [],
  storageTokenLocks: LockerV33.smartbch.tokenStorage,
  storageLiquidityLocks: LockerV33.smartbch.lpStorage,
};

const milkomedaArchives = {
  chain: "milkomeda",
  locks: [],
  storageTokenLocks: LockerV33.milkomeda.tokenStorage,
  storageLiquidityLocks: LockerV33.milkomeda.lpStorage,
};

const bitgertArchives = {
  chain: "bitgert",
  locks: [],
  storageTokenLocks: LockerV33.bitgert.tokenStorage,
  storageLiquidityLocks: LockerV33.bitgert.lpStorage,
};

const dexitArchives = {
  chain: "dexit",
  locks: [],
  storageTokenLocks: LockerV33.dexit.tokenStorage,
  storageLiquidityLocks: LockerV33.dexit.lpStorage,
};

const coreDaoArchives = {
  chain: "core",
  locks: [],
  storageTokenLocks: LockerV33.coreDao.tokenStorage,
  storageLiquidityLocks: LockerV33.coreDao.lpStorage,
};

const dogeArchives = {
  chain: "dogechain",
  locks: [],
  storageTokenLocks: LockerV33.doge.tokenStorage,
  storageLiquidityLocks: LockerV33.doge.lpStorage,
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
  bitgertArchives,
  dexitArchives,
  coreDaoArchives,
  dogeArchives,
};
