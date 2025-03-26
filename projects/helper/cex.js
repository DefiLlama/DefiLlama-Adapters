const ADDRESSES = require('./coreAssets.json')
const { nullAddress } = require('./unwrapLPs')
const { sumTokensExport } = require('../helper/sumTokens')
const sdk = require('@defillama/sdk')

const defaultTokens = {
  ethereum: [
    nullAddress,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.LINK,
    ADDRESSES.ethereum.DAI,
    ADDRESSES.ethereum.WEETH,
    ADDRESSES.ethereum.WBTC,
    ADDRESSES.ethereum.TUSD, // TUSD
    ADDRESSES.ethereum.BUSD, // BUSD
    ADDRESSES.ethereum.MATIC, // MATIC
    ADDRESSES.ethereum.INU, // SHIBA INU
    '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b', // CRO
    '0x9be89d2a4cd102d8fecc6bf9da793be995c22541',  // BBTC
    '0x7a58c0be72be218b41c608b7fe7c5bb630736c71',  // PEOPLE
    '0x69af81e73a73b40adf4f3d4223cd9b1ece623074',  // MASK
    '0x9d65ff81a3c488d585bbfb0bfe3c7707c7917f54',  // SSV
    '0x111111111117dc0aa78b770fa6a738034120c302',  // 1INCH
    '0x3597bfd533a99c9aa083587b074434e61eb0a258',  // DENT
    '0x8a2279d4a90b6fe1c4b30fa660cc9f926797baa2',  // CHR
    ADDRESSES.ethereum.LIDO,  // LIDO
    ADDRESSES.ethereum.MKR,  // MKR
    ADDRESSES.ethereum.CRV,  // CRV
    '0x92d6c1e31e14520e676a687f0a93788b716beff5',  // DYDX
    ADDRESSES.ethereum.FTM,  // FTM
    ADDRESSES.ethereum.SUSHI,  // SUSHI
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
    ADDRESSES.ethereum.UNI,  // UNI
    ADDRESSES.ethereum.AAVE,  // AAVE
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
    ADDRESSES.ethereum.STETH, //stETH
    '0x9ee91f9f426fa633d227f7a9b000e28b9dfd8599', //STmatic
    '0xc00e94cb662c3520282e6f5717214004a7f26888', //COMP
    '0x1c48f86ae57291f7686349f12601910bd8d470bb', //USDK
    '0x4691937a7508860f876c9c0a2a617e7d9e945d4b', // WOO
    '0x19de6b897ed14a376dda0fe53a5420d2ac828a28', // BGB bitget token
    '0x0316EB71485b0Ab14103307bf65a021042c6d380', // HBTC (Houbi BTC) https://explorer.btc.com/btc/address/12qTdZHx6f77aQ74CPCZGSY47VaRwYjVD8 / https://www.htokens.finance/en-us/assets
    '0x6be61833fc4381990e82d7d4a9f4c9b3f67ea941', // HTB (Hotbit cex token)
    '0x75231f58b43240c9718dd58b4967c5114342a86c', // OKB (OKX cex token)
    '0x2af5d2ad76741191d15dfe7bf6ac92d4bd912ca3', // LEO (bitfinex cex token)
    ADDRESSES.ethereum.BNB, // WBNB
    '0xb62132e35a6c13ee1ee0f84dc5d40bad8d815206', // NEXO ,(Nexo cex token)
    '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44', //kp3r
    '0xcf0c122c6b73ff809c693db761e7baebe62b6a2e', //FLOKI ETH CHAIN
    '0x11eef04c884e24d9b7b4760e7476d06ddf797f36', //MX TOKEN, mecx exchange token
    '0xa4be4cDC552891a6702E1aE9645EF445179a4463', //FON
    '0x356A5160F2B34BC8d88FB084745465eBBbed0174', //invi
    '0x9813037ee2218799597d83D4a5B6F3b6778218d9', //bone
    '0xf3b9569F82B18aEf890De263B84189bd33EBe452',//caw
    '0x04abeda201850ac0124161f037efd70c74ddc74c',//nest
    '0x9d71CE49ab8A0E6D2a1e7BFB89374C9392FD6804',//nvir
    '0x5b649C07E7Ba0a1C529DEAabEd0b47699919B4a2',//sgt
    '0x4385328cc4d643ca98dfea734360c0f596c83449',
    '0xbc396689893d065f41bc2c6ecbee5e0085233447', //perp
    '0xd7c49cee7e9188cca6ad8ff264c1da2e69d4cf3b', //NXM
    '0xaaef88cea01475125522e117bfe45cf32044e238', // GF
    '0x949d48eca67b17269629c7194f4b727d4ef9e5d6', // MC
    '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b', // AXS
    ADDRESSES.ethereum.FXS, // FXS
    '0xd417144312dbf50465b1c641d016962017ef6240',// cqt
    '0xcb84d72e61e383767c4dfeb2d8ff7f4fb89abc6e', //VEGA
    '0xcccd1ba9f7acd6117834e0d28f25645decb1736a', //ecox
    '0x25ec98773d7b4ced4cafab96a2a1c0945f145e10', // stUSDT
    '0x3c3a81e81dc49A522A592e7622A7E711c06bf354', // MNT
    '0x61e90a50137e1f645c9ef4a0d3a4f01477738406', // LOKA
    '0x64d0f55Cd8C7133a9D7102b13987235F486F2224', // BORG
    '0x925206b8a707096Ed26ae47C84747fE0bb734F59', //WBT
     ADDRESSES.ethereum.FDUSD, // FDUSD,
     ADDRESSES.ethereum.SDAI, //sdai
     '0x12970e6868f88f6557b76120662c1b3e50a646bf', //LADYS 
     '0x1e2f15302b90edde696593607b6bd444b64e8f02', //SHIRYO-INU
     '0x14fee680690900ba0cccfc76ad70fd1b95d10e16', //$PALL
     '0x9ce84f6a69986a83d92c324df10bc8e64771030f', //chex
     '0x68a47fe1cf42eba4a030a10cd4d6a1031ca3ca0a', //tet
     '0x329c6e459ffa7475718838145e5e85802db2a303', //emaid
     '0x3a856d4effa670c54585a5d523e96513e148e95d', //trias
     '0x1495bc9e44af1f8bcb62278d2bec4540cf0c05ea', //deia
     '0x4cff49d0a19ed6ff845a9122fa912abcfb1f68a6', //wtk
     "0x23878914efe38d27c4d67ab83ed1b93a74d4086a", //aEthUSDT
     "0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8", // aEthWETH
     "0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c", // aEthUSDC
     "0x6982508145454ce325ddbe47a25d4ec3d2311933", // PEPE
     ADDRESSES.ethereum.METH, //METH
     ADDRESSES.mantle.cmETH, // CMETH
     "0x54d2252757e1672eead234d27b1270728ff90581" // BITGET TOKEN, NEW
  ],
  tron: [
    nullAddress,
    ADDRESSES.tron.USDT, // USDT
    ADDRESSES.tron.USDC,  // USDC
    // 'TFptbWaARrWTX5Yvy3gNG5Lm8BmhPx82Bt', //wbt
    ADDRESSES.tron.TUSD,
    'TThzxNRLrW2Brp9DcTQU8i4Wd9udCWEdZ3', // stUSDT
    'TUPM7K8REVzD2UdV4R5fe5M8XbnR2DdoJ6', // HTX
  ],
  polygon: [
    nullAddress,
    ADDRESSES.polygon.USDT, // USDT
    ADDRESSES.polygon.WMATIC_1, // WMATIC
    ADDRESSES.polygon.WETH_1, // WETH
    ADDRESSES.polygon.QUICK, // QUICK
    ADDRESSES.polygon.WBTC, //WBTC
    ADDRESSES.polygon.USDC, //USDC
    ADDRESSES.polygon.DAI, //DAI
    '0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e', //xen
    '0x0169ec1f8f639b32eec6d923e24c2a2ff45b9dd6', //ALGB
    '0xd0258a3fd00f38aa8090dfee343f10a9d4d30d3f', //voxel
  ],
  algorand: [],
  solana: [
    ADDRESSES.solana.USDC, // USDC
    ADDRESSES.solana.USDT, // USDT
  ],
  bsc: [
    nullAddress,
    ADDRESSES.bsc.BTCB, // BTCB
    ADDRESSES.bsc.ETH, // BTCE
    '0xfd5840cd36d94d7229439859c0112a4185bc0255', // vUSDT
    ADDRESSES.bsc.BETH, // BETH
    '0x95c78222b3d6e262426483d42cfa53685a67ab9d', // vBUSD
    '0x7083609fce4d1d8dc0c979aab8c869ea2c873402', // BDOT
    '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82', // CAKE
    ADDRESSES.bsc.USDT, // BUSDT
    ADDRESSES.bsc.BUSD, // BUSD
    '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe', // BXRP
    ADDRESSES.bsc.USDC, // B-USDC
    ADDRESSES.bsc.BTUSD, // B-TUSD
    '0x2859e4544c4bb03966803b044a93563bd2d0dd4d', // SHIB
    '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47', // ADA
    '0x4691937a7508860f876c9c0a2a617e7d9e945d4b', // WOO
    '0xc748673057861a797275CD8A068AbB95A902e8de', // BabyDoge
    '0xAC51066d7bEC65Dc4589368da368b212745d63E8', // ALICE
    '0xfb5B838b6cfEEdC2873aB27866079AC55363D37E', // FLOKI
    '0x352Cb5E19b12FC216548a2677bD0fce83BaE434B', // BTT
    '0xAD29AbB318791D579433D831ed122aFeAf29dcfe', // FTM
    '0x02ff5065692783374947393723dba9599e59f591',// yoshi
     ADDRESSES.bsc.TUSD, //TUSD
     '0x965f527d9159dce6288a2219db51fc6eef120dd1', //BSW
     '0xa2120b9e674d3fc3875f415a7df52e382f141225', //ata
     '0x44ec807ce2f4a6f2737a92e985f318d035883e47', //HFT
     ADDRESSES.ethereum.FDUSD, //FDUSD
     '0xeac9873291ddaca754ea5642114151f3035c67a2', //dcb
     '0xaaa9214f675316182eaa21c85f0ca99160cc3aaa', //qanx
     '0x2d060ef4d6bf7f9e5edde373ab735513c0e4f944', //aitech
     '0x47c454ca6be2f6def6f32b638c80f91c9c3c5949', //gfall
     '0xfe1d7f7a8f0bda6e415593a2e4f82c64b446d404', //blp
     '0xe9d78bf51ae04c7e1263a76ed89a65537b9ca903', // GMEX
     '0x59769630b236398c2471eb26e6a529448030d94f', //NKYC nonkyc exchange token
     '0xbf5140a22578168fd562dccf235e5d43a02ce9b1', // UNI
     '0x25d887ce7a35172c62febfd67a1856f20faebb00', //pepe
     '0x2024b9be6b03f2a57d3533ae33c7e1d0b0b4be47', //Bitcointry exchange token BTTY
  ],
  eos: [
    ["eosio.token", "EOS", "eos"],
    ["tethertether", "USDT", "tether"],
  ],
  arbitrum: [
    nullAddress,
    ADDRESSES.arbitrum.USDC, // USDC
    ADDRESSES.arbitrum.USDT, // USDT
    ADDRESSES.arbitrum.DAI, // DAI
    '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', //aidoge
    '0x3082cc23568ea640225c2467653db90e9250aaa0', //rdnt
    '0x088cd8f5ef3652623c22d48b1605dcfe860cd704', //vela
    ADDRESSES.arbitrum.LPT, //lpt
    '0x51fc0f6660482ea73330e414efd7808811a57fa2', //premia
    '0x25d887ce7a35172c62febfd67a1856f20faebb00', //pepe
  ],
  avax: [
    nullAddress,
    ADDRESSES.avax.USDt, // USDT
    ADDRESSES.avax.USDC, // USDC
    ADDRESSES.avax.DAI, // DAI
    '0xabc9547b534519ff73921b1fba6e672b5f58d083', // WOO
    ADDRESSES.avax.USDC_e, //USDC.e
  ],
  near: [
    'usdt.tether-token.near',
  ],
  optimism: [
    nullAddress,
    ADDRESSES.optimism.OP, //OP
    ADDRESSES.optimism.USDT,  //USDT
    ADDRESSES.optimism.USDC,  //USDC
    ADDRESSES.optimism.DAI, // DAI
    '0x217d47011b23bb961eb6d93ca9945b7501a5bb11' //thales
  ],
  linea: [
    nullAddress,
   ADDRESSES.linea.USDT, //bridge usdt
   ADDRESSES.linea.USDC, //usdc bridge
   ADDRESSES.linea.DAI //dai bridge
  ],
  flare: [
    nullAddress,
    ADDRESSES.flare.WFLR,
  ],
  celo: [
    nullAddress,
    ADDRESSES.celo.CELO, //celo
    ADDRESSES.celo.cUSD, //cUSD
  ],
  moonbeam: [
    nullAddress,
    ADDRESSES.telos.USDT, //usdt
    "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9", //usdc
  ],
  moonriver: [
    nullAddress,
    ADDRESSES.moonriver.USDT, //usdt
  ],
  kava: [
    nullAddress,
    ADDRESSES.kava.USDT,
    ADDRESSES.kava.USDt,
    ADDRESSES.kava.USDC
  ],
  cronos: [
    nullAddress,
    ADDRESSES.cronos.USDC,
    ADDRESSES.cronos.USDT,
    ADDRESSES.cronos.WBTC,
    "0xe44fd7fcb2b1581822d0c862b68222998a0c299a" //weth
  ],
  ton: [
    nullAddress,
    ADDRESSES.ton.USDT,
    ADDRESSES.ton.TON_1,
    ADDRESSES.ton.TON_2,
    ADDRESSES.ton.TON_3,
  ],
  sui: [],
  aptos: [],
  mantle: [
    nullAddress,
    ADDRESSES.mantle.USDC,
    ADDRESSES.mantle.USDT,
    ADDRESSES.mantle.cmETH,
    ADDRESSES.mantle.mETH,
    ADDRESSES.mantle.WETH,
    ADDRESSES.mantle.WMNT,
    ADDRESSES.mantle.USDe,
    ADDRESSES.mantle.sUSDe,
    ADDRESSES.mantle.AUSD,
    ADDRESSES.mantle.FBTC
  ],
}

function cexExports(config) {
  const chains = Object.keys(config).filter(i => i !== 'bep2')
  const exportObj = {
    timetravel: false,
  }
  chains.forEach(chain => {
    let { tokensAndOwners, owners, tokens, blacklistedTokens, } = config[chain]

    if (!tokensAndOwners && !tokens && chain !== 'solana') {
      tokens = defaultTokens[chain]
      if (!tokens) {
        // log(chain, 'Missing default token list, counting only native token balance',)
        tokens = [nullAddress]
      }
    }

    const options = { ...config[chain], owners, tokens, chain, blacklistedTokens, }
    if (chain === 'solana')  options.solOwners = owners
    if (chain === 'ton')  options.onlyWhitelistedTokens = true
    exportObj[chain] = { tvl: sumTokensExport(options) }
  })
  if (config.bep2) {
    exportObj.bsc = exportObj.bsc ?? { tvl: () => ({}) }
    const bscTvl = exportObj.bsc.tvl
    exportObj.bsc.tvl = sdk.util.sumChainTvls([
      bscTvl, sumTokensExport({ ...config.bep2 })
    ])
  }
  return exportObj
}

module.exports = {
  cexExports,
  defaultTokens,
}