// const { ethereum } = require(".")

const { getNumLockedTokens, getLockedTokenAtIndex,
  lockedTokensLength, lockedToken } = require('./abis')

const presaleLockers = {
  bsc: [
    '0x7100c01f668a5B407dB6A77821DDB035561F25B8',
    '0xc5fE280422117461af9b953Da413e9627E3b9a40',
    '0x9c55c9E02295B3E8C00501358E8289afc8b39edF',
    '0xbaCEbAd5993a19c7188Db1cC8D0F748C9Af1689A',
  ],
  ethereum: [
    '0x1DCbc803Ae6d4168b6cadA28B6A103155c7d7fC4',
    '0xC7065e692D2caCF7173C7BC08c6849eb9Ef48b38',
    '0x58C38bF08BD023824ABD05Db9a4e4CAb991E447C',
    '0x4B170Bb56032Ca068fF0Ee03943a9B9bc1554C9A',
  ],
  arbitrum: [
    '0x47BAcf935066b802EAA0067eC14AB035B24eB78b',
  ],
  celo: [
    '0x832CcF861059Cb352515E89Cc54F1b13C6620D37',
  ],
  kcc: [
    '0x6e98c276576be2bb221167826b376c79ffb27178',
    '0xE3156716bEc777E93edd00253063A72b3076C65E',
  ],
  harmony: [
    '0xcd5fD649Da9E0563BbbdD555ab6006Dc9a596b49',
    '0x7cc70850f1f7beb7774a0fe06830378a02b079b8',
    '0x77D054b8e61A141CE51fc9Cc3E9E2C3B79F57809',
  ],
  avax: [
    '0x7EBF0deb916cc4Cc54859b528617F6bE8Dc669BA',
    '0xcd5fD649Da9E0563BbbdD555ab6006Dc9a596b49',
    '0xEd85DaE67fF56335136beeA446AD2aAf04b1EA6c',
  ],
  xdai: [
    '0x21356BBF82C71d7eAC11e246574A521b2EbF7944',
    '0x2370d852871418a1A968c834a40e73C9c6f4B667',
    '0x19641A259afAF9Bc92Ee02C2BA4c672a80B931B6',
  ],
  fantom: [
    '0x4Ee184B382273905b79a42db0C43094f9A951514',
    '0xd5F1593D585cbAC2d5bCae2dbae4fc159375C6dD',
    '0x227Dd61A303aAbBE2B9823Ae6d380A6e43008A6f',
    '0xbd9f4452C59175DDf3A9F6D9d1F4ACde0CD4663A',
  ],
  polygon: [
    '0x020B4f43BD0fb82cFe9427F81E0E5FCCE433f3f5',
    '0x9c55c9E02295B3E8C00501358E8289afc8b39edF',
    '0x1C8aB27b538b5e43c151460cBc6D271cB9EeE4aF',
    '0xe839d166F01c256c0DA9247DC8ceBC128D9c7d9F',
    '0x04c84C36E70Dcf4154B6cFBf3Be196F3E4AE51BA',
  ],
  okexchain: [
    '0xaB6A25CC60F5f6793c72Bbf957a2E501F1B43B7c',
  ],
  cronos: [
    '0xFAfceA08F86a1864F5D7D49fd2A2B3186C9489c0',
  ],
  moonriver: [
    '0x3052b62d39624f341D44b195D2E4b865f074B656',
  ],
  heco: [
    '0x19641A259afAF9Bc92Ee02C2BA4c672a80B931B6',
  ],
  smartbch: [
    '0xcd5fD649Da9E0563BbbdD555ab6006Dc9a596b49',
  ],
}

  const LockersV3 = {
bsc: [
  '0xEb3a9C56d963b971d320f889bE2fb8B59853e449',
  '0x8655E5c4D701186D16765d1CDcef6D5287E4679a',
  '0x5b5e94485c9628793B01A38762921Dc37B6829b6',
  '0x2D045410f002A95EFcEE67759A92518fA3FcE677',
  '0x81E0eF68e103Ee65002d3Cf766240eD1c070334d',
],
    ethereum: [
      '0x1Ba00C14F9E8D1113028a14507F1394Dc9310fbD',
      '0xe74083baFE69cd74519C6a40a3Ad0723BD360BDD',
      '0xc68C522682614A9F1D336f756c0C0D71352925D3',
      '0x916a8C33B784f6399Ce8b7aff59d4AAD29386B8E',
      '0xBae21D4247dd3818f720ab4210C095E84e980D96',
    ],
    arbitrum: [
      '0x51f411d40641475576622c8fba77F1e917e96Df4',
      '0xdf17aC098Fa81373625e102061844C02ECCEc645',
    ],
    celo: [
      '0xC7065e692D2caCF7173C7BC08c6849eb9Ef48b38',
      '0xdf17aC098Fa81373625e102061844C02ECCEc645',
    ],
    kucoin: [
      '0x3052b62d39624f341D44b195D2E4b865f074B656',
      '0xd5071536d1A2AfF6dB130917B4c1FA7b8Daf47ff',
      '0x1C8aB27b538b5e43c151460cBc6D271cB9EeE4aF',
      '0x020B4f43BD0fb82cFe9427F81E0E5FCCE433f3f5',
    ],
    harmony: [
      '0xd5F1593D585cbAC2d5bCae2dbae4fc159375C6dD',
      '0xB3C0Bc5D284c9f01a0d4c4eab8546D4D124612cD',
      '0x4B170Bb56032Ca068fF0Ee03943a9B9bc1554C9A',
      '0xadC5caC1E3CD46Fe8d5b98DB4Ea6eE241a19dCEE',
      '0x13455DeE5199691f11ffBb4AAf59Af56F23b95aE',
    ],
    avalanche: [
      '0x69275e94cC431e380EebCbda6FB8e19f931cD359',
      '0x77D054b8e61A141CE51fc9Cc3E9E2C3B79F57809',
      '0xadC5caC1E3CD46Fe8d5b98DB4Ea6eE241a19dCEE',
      '0x10f485B855bE8E7D377fbE60E5D5676d88817b95',
    ],
    xdai: [
      '0x77D054b8e61A141CE51fc9Cc3E9E2C3B79F57809',
      '0x832CcF861059Cb352515E89Cc54F1b13C6620D37',
      '0xeA8d06F70E1a5BD1Bf6cE927e62C8E370f5aAfC1',
      '0x63d20Bf9Aa36b8bE580b19B024dD8b62a9f11F3b',
      '0x554d523a54471F12dDE2152A7F33E159404d199e',
    ],
    fantom: [
      '0x318Aa10323Bb8DDD163AdB61F0C54Cfa85b4132e',
      '0xc1E3f48e23D899A326C31df6A2850457F50710F8',
      '0x832CcF861059Cb352515E89Cc54F1b13C6620D37',
      '0x1C8aB27b538b5e43c151460cBc6D271cB9EeE4aF',
      '0xb5566a206a89bd9C004230e6F6ac7335C77043cd',
    ],
    polygon: [
      '0xEb3a9C56d963b971d320f889bE2fb8B59853e449',
      '0x6FCC2e4Efb4E05DdfC2154AbE209356d5A687666',
      '0x036063706396Ad5Dc49241451E955fbE05899cDe',
      '0x2D045410f002A95EFcEE67759A92518fA3FcE677',
      '0xb5566a206a89bd9C004230e6F6ac7335C77043cd',
    ]

  }

  const LockerV33 = {
  bsc : [
    '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
    '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
  ],
    ethereum : [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
    arbitrum: [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
    celo: [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
    kucoin: [
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
    ],
    harmony: [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
    avalanche: [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
    xdai: [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
    fantom: [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
    polygon: [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
    oec: [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
    cronos: [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
    moonriver: [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
    heco: [
      '0xFEE2A3f4329e9A1828F46927bD424DB2C1624985',
      '0x983b00a2C3d8925cEDfC9f3eb5Df1aE121Ff6B9F',
    ],
  }


  const protocolPairs = {
    sale_BNB: '0x61cA6ae520b9c9Cfab0B66aFaD78FF7127bA37B6',
    sale_ETH: '0xAAe5f80BaC0c7fA0cAd6c2481771a3B17aF21455',
    sale_HT: '0x4A677fF39B731861AfBA6051b95755B6704FB5eA',
    sale_MATIC_sushi: '0x5a2bA689663fD35eC111676294055bd9FA47fdE8',
    sale_MATIC_quick: '0xf2f46CFC363ff5554801Eb38944148cF3D40d82F',
  }


  const tokens = {
    sale_BSC: '0x04F73A09e2eb410205BE256054794fB452f0D245',
    sale_ETH: '0xf063fe1ab7a291c5d06a86e14730b00bf24cb589',
    sale_Heco: '0x2665375a48A76BB49F6b375844eB88390840C0B8',
    sale_MATIC: '0x8f6196901a4a153d8ee8f3fa779a042f6092d908',
    weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  }

  const coreTokenWhitelist = {
    bsc: [
     '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // wbnb
    '0xe9e7cea3dedca5984780bafc599bd69add087d56',  // busd
    '0x55d398326f99059ff775485246999027b3197955',  // usdt
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'], // usdc
    ethereum:  [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // weth
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',  // usdc
    '0xdac17f958d2ee523a2206206994597c13d831ec7',  // usdt
    '0x6b175474e89094c44da98b954eedeac495271d0f'], // dai
    polygon: [
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',  // wmatic
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',  // usdc
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'], // weth
    avalanche: [
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',  // wavax
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',  // usdc
    '0xc7198437980c041c805a1edcba50c1ce5db95118'], // usdt
    xdai: [
    '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',  // wxdai
    '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',  // weth
    '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',  // usdt
    '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83']  // usdc
  }


const config = {
  uniswapv2: {
    chain: "ethereum",
    locker: "0x663a5c229c09b049e36dcc11a9b0d4a8eb9db214",
    factory: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f",
    startBlock: 11463946
  },
  pol: {
    chain: "ethereum",
    locker: "0x17e00383a843a9922bca3b280c0ade9f8ba48449",
    factory: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f",
    startBlock: 10503171
  },
  sushiswap: {
    chain: "ethereum",
    locker: '0xed9180976c2a4742c7a57354fd39d8bec6cbd8ab',
    factory: "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac",
    startBlock: 12010517
  },
  pancakeswapv2: {
    chain: "bsc",
    locker: "0xc765bddb93b0d1c1a88282ba0fa6b2d00e3e0c83",
    factory: "0xca143ce32fe78f1f7019d7d551a6402fc5350c73",
    startBlock: 6878262
  },
  pancakeswapv1: {
    chain: 'bsc',
    locker: '0xc8B839b9226965caf1d9fC1551588AaF553a7BE6',
    factory: '0xbcfccbde45ce874adcb698cc183debcf17952812',
    startBlock: 5155584
  },
  biswap: {
    chain: 'bsc',
    locker: '0x74dee1a3e2b83e1d1f144af2b741bbaffd7305e1',
    factory: '0x858e3312ed3a876947ea49d572a7c42de08af7ee',
    startBlock: 18251487
  },
  safeswap: {
    chain: 'bsc',
    locker: '0x1391b48c996ba2f4f38aee07e369a8f28d38220e',
    factory: '0x86a859773cf6df9c8117f20b0b950ada84e7644d',
    startBlock: 12508447
  },
  julswap: {
    chain: 'bsc',
    locker: '0x1f23742D882ace96baCE4658e0947cCCc07B6a75',
    factory: '0x553990f2cba90272390f62c5bdb1681ffc899675',
    startBlock: 5281114
  },
  quickswap: {
    chain: 'polygon',
    locker: '0xadb2437e6f65682b85f814fbc12fec0508a7b1d0',
    factory: '0x5757371414417b8c6caad45baef941abc7d3ab32',
    startingBlock: 11936505
  },
  traderjoe: {
    chain: 'avax',
    locker: '0xa9f6aefa5d56db1205f36c34e6482a6d4979b3bb',
    factory: '0x9ad6c38be94206ca50bb0d90783181662f0cfa10',
    startingBlock: 11933326
  },
  honeyswap: {
    chain: 'xdai',
    locker: '0xe3D32266974f1E8f8549cAf9F54977040e7D1c07',
    factory: '0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7',
    startBlock: 14476818
  }
}

const polygonArchives =
  {
    chain: "polygon",
    locks: LockersV3.polygon,
    presales: presaleLockers.polygon
  }
const bscArchives =
  {
    chain: "bsc",
    locks: LockersV3.bsc,
    presales: presaleLockers.bsc
  }
const ethereumArchives =
  {
    chain: "ethereum",
    locks: LockersV3.ethereum,
    presales: presaleLockers.ethereum
  }
const arbitrumArchives =
  {
    chain: "arbitrum",
    locks: LockersV3.arbitrum,
    presales: presaleLockers.arbitrum
  }
const celoArchives =
  {
    chain: "celo",
    locks: LockersV3.celo,
    presales: presaleLockers.celo
  }
const kucoinArchives =
  {
    chain: "kcc",
    locks: LockersV3.kucoin,
    presales: presaleLockers.kucoin
  }
const harmonyArchives =
  {
    chain: "harmony",
    locks: LockersV3.harmony,
    presales: presaleLockers.harmony
  }
const avalancheArchives =
  {
    chain: "avalanche",
    locks: LockersV3.avalanche,
    presales: presaleLockers.avalanche
  }
const xdaiArchives =
  {
    chain: "xdai",
    locks: LockersV3.xdai,
    presales: presaleLockers.xdai
  }
const fantomArchives =
  {
    chain: "fantom",
    locks: LockersV3.fantom,
    presales: presaleLockers.fantom
  }




module.exports = {
  polygonArchives,
  bscArchives,
  ethereumArchives,
  arbitrumArchives,
  celoArchives,
  kucoinArchives,
  harmonyArchives,
  avalancheArchives,
  xdaiArchives,
  fantomArchives,
  coreTokenWhitelist,
  protocolPairs,
  config,
  tokens
}
