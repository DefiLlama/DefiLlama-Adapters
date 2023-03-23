const { tokensBare, } = require('./tokenMapping')
const { nullAddress } = require('./unwrapLPs')
const { sumTokensExport } = require('../helper/sumTokens')
const sdk = require('@defillama/sdk')

const defaultTokens = {
  ethereum: [
    nullAddress,
    tokensBare.usdt,
    tokensBare.usdc,
    tokensBare.link,
    tokensBare.dai,
    tokensBare.wbtc,
    '0x0000000000085d4780B73119b644AE5ecd22b376', // TUSD
    '0x4fabb145d64652a948d72533023f6e7a623c7c53', // BUSD
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // MATIC
    '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', // SHIBA INU
    '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b', // CRO
    '0x9be89d2a4cd102d8fecc6bf9da793be995c22541',  // BBTC
    '0x7a58c0be72be218b41c608b7fe7c5bb630736c71',  // PEOPLE
    '0x69af81e73a73b40adf4f3d4223cd9b1ece623074',  // MASK
    '0x9d65ff81a3c488d585bbfb0bfe3c7707c7917f54',  // SSV
    '0x111111111117dc0aa78b770fa6a738034120c302',  // 1INCH
    '0x3597bfd533a99c9aa083587b074434e61eb0a258',  // DENT
    '0x8a2279d4a90b6fe1c4b30fa660cc9f926797baa2',  // CHR
    '0x5a98fcbea516cf06857215779fd812ca3bef1b32',  // LIDO
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',  // MKR
    '0xd533a949740bb3306d119cc777fa900ba034cd52',  // CRV
    '0x92d6c1e31e14520e676a687f0a93788b716beff5',  // DYDX
    '0x4e15361fd6b4bb609fa63c81a2be19d873717870',  // FTM
    '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',  // SUSHI
    '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da', // GALA
    '0x3845badade8e6dff049820680d1f14bd3903a5d0',  // SAND
    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',  // MANA
    '0x3506424f91fd33084466f402d5d97f05f8e3b4af',  // CHZ
    '0x4d224452801aced8b2f0aebe155379bb5d594381',  // APE
    '0x6c6ee5e31d828de241282b9606c8e98ea48526e2',  // HOT
    '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c',  // ENJ
    '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd',  // LRC
    '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',  // ENS
    '0x45804880de22913dafe09f4980848ece6ecbaf78',  // PAXG
    '0xf411903cbc70a74d22900a5de66a2dda66507255',  // VRA
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',  // UNI
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',  // AAVE
    '0xc944e90c64b2c07662a292be6244bdf05cda44a7',  // GRT
    '0x4a220e6096b25eadb88358cb44068a3248254675',  // QNT
    '0xf34960d9d60be18cC1D5Afc1A6F012A723a28811',  // KCS
    '0xa2cd3d43c775978a96bdbf12d733d5a1ed94fb18',  //XCN
    '0xE66747a101bFF2dBA3697199DCcE5b743b454759',  //GT
    '0x3883f5e181fccaF8410FA61e12b59BAd963fb645',  //THETA
    '0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5', //BITDAO
    '0x6f259637dcd74c767781e37bc6133cd6a68aa161',  //HT
    '0xba9d4199fab4f26efe3551d490e3821486f135ba', //CHSB
    '0xdc9Ac3C20D1ed0B540dF9b1feDC10039Df13F99c', //UTK
    '0xd13c7342e1ef687c5ad21b27c2b65d772cab5c8c', //UOS
    '0x90b831fa3bebf58e9744a14d638e25b4ee06f9bc', //MIMO
    '0x408e41876cccdc0f92210600ef50372656052a38', //REN
    '0xC581b735A1688071A1746c968e0798D642EDE491', //EURO-T
    '0x4da27a545c0c5b758a6ba100e3a049001de870f5', //aAAVE
    '0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0', //aLINK
    '0xae7ab96520de3a18e5e111b5eaab095312d7fe84', //stETH
    '0x9ee91f9f426fa633d227f7a9b000e28b9dfd8599', //STmatic
    '0xc00e94cb662c3520282e6f5717214004a7f26888', //COMP
    '0x1c48f86ae57291f7686349f12601910bd8d470bb', //USDK
    '0x4691937a7508860f876c9c0a2a617e7d9e945d4b', // WOO
    '0x19de6b897ed14a376dda0fe53a5420d2ac828a28', // BGB bitget token
    '0x0316EB71485b0Ab14103307bf65a021042c6d380', // HBTC (Houbi BTC) https://explorer.btc.com/btc/address/12qTdZHx6f77aQ74CPCZGSY47VaRwYjVD8 / https://www.htokens.finance/en-us/assets
    '0x6be61833fc4381990e82d7d4a9f4c9b3f67ea941', // HTB (Hotbit cex token)
    '0x75231f58b43240c9718dd58b4967c5114342a86c', // OKB (OKX cex token)
    '0x2af5d2ad76741191d15dfe7bf6ac92d4bd912ca3', // LEO (bitfinex cex token)
    '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', // WBNB
    '0xb62132e35a6c13ee1ee0f84dc5d40bad8d815206', // NEXO ,(Nexo cex token)
    '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44', //kp3r
    '0xcf0c122c6b73ff809c693db761e7baebe62b6a2e', //FLOKI ETH CHAIN
  ],
  tron: [
    nullAddress,
    'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT
    'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',  // USDC
  ],
  polygon: [
    nullAddress,
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
    '0x0000000000000000000000000000000000001010', // WMATIC
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
    '0xb5c064f955d8e7f38fe0460c556a72987494ee17', // QUICK
    '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', //WBTC
  ],
  algorand: [],
  solana: [],
  bsc: [
    nullAddress,
    '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', // BTCB
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // BTCE
    '0xfd5840cd36d94d7229439859c0112a4185bc0255', // vUSDT
    '0x250632378e573c6be1ac2f97fcdf00515d0aa91b', // BETH
    '0x95c78222b3d6e262426483d42cfa53685a67ab9d', // vBUSD
    '0x7083609fce4d1d8dc0c979aab8c869ea2c873402', // BDOT
    '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', // CAKE
    '0x55d398326f99059ff775485246999027b3197955', // BUSDT
    '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
    '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe', // BXRP
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // B-USDC
    '0x14016e85a25aeb13065688cafb43044c2ef86784', // B-TUSD
    '0x2859e4544c4bb03966803b044a93563bd2d0dd4d', // SHIB
    '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47', // ADA
    '0x4691937a7508860f876c9c0a2a617e7d9e945d4b', // WOO
    '0xc748673057861a797275CD8A068AbB95A902e8de', // BabyDoge
    '0xAC51066d7bEC65Dc4589368da368b212745d63E8', // ALICE
    '0xfb5B838b6cfEEdC2873aB27866079AC55363D37E', // FLOKI
    '0x352Cb5E19b12FC216548a2677bD0fce83BaE434B', // BTT
    '0xAD29AbB318791D579433D831ed122aFeAf29dcfe', // FTM
    '0x02ff5065692783374947393723dba9599e59f591',// yoshi
  ],
  eos: [
    ["eosio.token", "EOS", "eos"],
    ["tethertether", "USDT", "tether"],
  ],
  arbitrum: [
    nullAddress,
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
    
  ],
  avax: [
    nullAddress,
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', // USDT
    '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
    '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', // DAI
    '0xabc9547b534519ff73921b1fba6e672b5f58d083', // WOO
    '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', //USDC.e
  ],
  near: [
    'usdt.tether-token.near',
  ],
  optimism: [
    nullAddress,
    '0x4200000000000000000000000000000000000042', //OP
    '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',  //USDT
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',  //USDC
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' // DAI
  ],
}

function cexExports(config) {
  const chains = Object.keys(config).filter(i => i !== 'bep2')
  const exportObj = {
    timetravel: false,
  }
  chains.forEach(chain => {
    let { tokensAndOwners, owners, tokens, blacklistedTokens, } = config[chain]

    if (!tokensAndOwners && !tokens) {
      tokens = defaultTokens[chain]
      if (!tokens) {
        // log(chain, 'Missing default token list, counting only native token balance',)
        tokens = [nullAddress]
      }
    }

    const options = { ...config[chain], owners, tokens, chain, blacklistedTokens, }
    if (chain === 'solana')  options.solOwners = owners
    exportObj[chain] = { tvl: sumTokensExport(options) }
  })
  if (config.bep2) {
    const bscTvl = exportObj.bsc.tvl
    exportObj.bsc.tvl = sdk.util.sumChainTvls([
      bscTvl, sumTokensExport({ chain: 'bep2', ...config.bep2 })
    ])
  }
  return exportObj
}

module.exports = {
  cexExports,
}