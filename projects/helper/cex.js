const ADDRESSES = require('./coreAssets.json')
const { nullAddress } = require('./unwrapLPs')
const { sumTokensExport } = require('../helper/sumTokens')
const sdk = require('@defillama/sdk')
const { getCEXTokensOnBinanceOnChain } = require('./utils/cex')
const { svmChainsSet } = require('./svmChainConfig')

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
    ADDRESSES.ethereum.LIDO,  // LIDO
    ADDRESSES.ethereum.MKR,  // MKR
    ADDRESSES.ethereum.CRV,  // CRV
    '0x92d6c1e31e14520e676a687f0a93788b716beff5',  // DYDX
    ADDRESSES.ethereum.FTM,  // FTM
    ADDRESSES.ethereum.SUSHI,  // SUSHI
    '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da', // GALA
    '0xf411903cbc70a74d22900a5de66a2dda66507255',  // VRA
    ADDRESSES.ethereum.UNI,  // UNI
    ADDRESSES.ethereum.AAVE,  // AAVE
    '0xf34960d9d60be18cC1D5Afc1A6F012A723a28811',  // KCS
    '0xa2cd3d43c775978a96bdbf12d733d5a1ed94fb18',  //XCN
    '0xE66747a101bFF2dBA3697199DCcE5b743b454759',  //GT
    '0x3883f5e181fccaF8410FA61e12b59BAd963fb645',  //THETA
    '0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5', //BITDAO
    '0x6f259637dcd74c767781e37bc6133cd6a68aa161',  //HT
    '0xba9d4199fab4f26efe3551d490e3821486f135ba', //CHSB
    '0xd13c7342e1ef687c5ad21b27c2b65d772cab5c8c', //UOS
    '0x90b831fa3bebf58e9744a14d638e25b4ee06f9bc', //MIMO
    '0xC581b735A1688071A1746c968e0798D642EDE491', //EURO-T
    '0x4da27a545c0c5b758a6ba100e3a049001de870f5', //aAAVE
    '0xa06bc25b5805d5f8d82847d191cb4af5a3e873e0', //aLINK
    ADDRESSES.ethereum.STETH, //stETH
    '0x9ee91f9f426fa633d227f7a9b000e28b9dfd8599', //STmatic
    '0x1c48f86ae57291f7686349f12601910bd8d470bb', //USDK
    '0x19de6b897ed14a376dda0fe53a5420d2ac828a28', // BGB bitget token
    '0x0316EB71485b0Ab14103307bf65a021042c6d380', // HBTC (Houbi BTC) https://explorer.btc.com/btc/address/12qTdZHx6f77aQ74CPCZGSY47VaRwYjVD8 / https://www.htokens.finance/en-us/assets
    '0x6be61833fc4381990e82d7d4a9f4c9b3f67ea941', // HTB (Hotbit cex token)
    '0x75231f58b43240c9718dd58b4967c5114342a86c', // OKB (OKX cex token)
    '0x2af5d2ad76741191d15dfe7bf6ac92d4bd912ca3', // LEO (bitfinex cex token)
    ADDRESSES.ethereum.BNB, // WBNB
    '0x11eef04c884e24d9b7b4760e7476d06ddf797f36', //MX TOKEN, mecx exchange token
    '0xa4be4cDC552891a6702E1aE9645EF445179a4463', //FON
    '0x356A5160F2B34BC8d88FB084745465eBBbed0174', //invi
    '0x9813037ee2218799597d83D4a5B6F3b6778218d9', //bone
    '0xf3b9569F82B18aEf890De263B84189bd33EBe452',//caw
    // '0x04abeda201850ac0124161f037efd70c74ddc74c',//nest -- old token, hacked
    '0x9d71CE49ab8A0E6D2a1e7BFB89374C9392FD6804',//nvir
    '0x5b649C07E7Ba0a1C529DEAabEd0b47699919B4a2',//sgt
    '0x4385328cc4d643ca98dfea734360c0f596c83449',
    '0xd7c49cee7e9188cca6ad8ff264c1da2e69d4cf3b', //NXM
    '0xaaef88cea01475125522e117bfe45cf32044e238', // GF
    ADDRESSES.ethereum.FXS, // FXS
    '0xd417144312dbf50465b1c641d016962017ef6240',// cqt
    '0xcb84d72e61e383767c4dfeb2d8ff7f4fb89abc6e', //VEGA
    '0xcccd1ba9f7acd6117834e0d28f25645decb1736a', //ecox
    '0x25ec98773d7b4ced4cafab96a2a1c0945f145e10', // stUSDT
    '0x3c3a81e81dc49A522A592e7622A7E711c06bf354', // MNT
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
    "0x54d2252757e1672eead234d27b1270728ff90581", // BITGET TOKEN, NEW
    ADDRESSES.ethereum.USDe, // USDE
    "0x136471a34f6ef19fe571effc1ca711fdb8e49f2b", //USYC
    "0x7712c34205737192402172409a8f7ccef8aa2aec", // BUIDL
    '0xaf6186b3521b60e27396b5d23b48abc34bf585c5', // GUSD - STABLE FROM GATE,IO EXCHANGE
    ADDRESSES.bsc.USD1, //USD1
    '0xc2d09cf86b9ff43cb29ef8ddca57a4eb4410d5f3',  //GTBTC
    '0x1b66474c8eca3827f16202907f41f63785579716', // exchange token for weex, 
    ADDRESSES.ethereum.INU, //shib
    '0x8947da500Eb47F82df21143D0C01A29862a8C3c5', //thales
    ADDRESSES.ethereum.POL, //pol
    '0x1ffEFD8036409Cb6d652bd610DE465933b226917', //ever
    '0xaaa9214f675316182eaa21c85f0ca99160cc3aaa', //QANX
    ADDRESSES.ethereum.SNX, //SNX
    '0xe76c5b78f93909d34404e9eb4c1f19e7582a5de1', //H (Humanity Protocol)
    ADDRESSES.ethereum.ETHFI, //ETHFI (ether.fi)
    '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f', //GHO (Aave stablecoin)
    '0x951f086a127e280724fd93ccc543f65065afeb5e', // DOS
    '0x232ce3bd40fcd6f80f3d55a522d03f25df784ee2', // LIT
    '0x904567252d8f48555b7447c67dca23f0372e16be', // KITE
    '0xdef1b2d939edc0e4d35806c59b3166f790175afe', // INX
    '0x2798b1cc5a993085e8a9d46e80499f1b63f42204', // GWEI
    '0x230f1e241c621d5af670dad83ebcdd18971e2995', // NES
    '0xaaee1a9723aadb7afa2810263653a34ba2c21c7a', // MOG
    '0x33f6be84becff45ea6aa2952d7ef890b44bfb59d', // ON
    '0x7Ddc52c4De30e94Be3A6A0A2b259b2850f421989', // GOMINING
    '0x50f41f589afaca2ef41fdf590fe7b90cd26dee64', // IRYS
    '0x45e02bc2875a2914c4f585bbf92a6f28bc07cb70', // MBG
    '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD', // USTC
    '0xcedbea37c8872c4171259cdfd5255cb8923cf8e7', // XAN
    '0xb2617246d0c6c0087f18703d576831899ca94f01', // ZIG
    '0x216b3643ff8b7bb30d8a48e9f1bd550126202add', // ACU
    '0x626e8036deb333b408be468f951bdb42433cbf18', // AIOZ
    '0x76a0e27618462bdac7a29104bdcfff4e6bfcea2d', // SOSO
    '0x0e63b9c287e32a05e6b9ab8ee8df88a2760225a9', // PIEVERSE
    '0x25931894a86d47441213199621f1f2994e1c39aa', // CGPT
    '0xf3e4872e6a4cf365888d93b6146a2baa7348f1a4', // SLVON
    '0x525A8F6F3Ba4752868cde25164382BfbaE3990e1', // NYM
    '0xf944e35f95e819e752f3ccb5faf40957d311e8c5', // MOCA
    '0x10dea67478c5F8C5E2D90e5E9B26dBe60c54d800', // TAIKO
    '0x17205fab260a7a6383a81452ce6315a39370db97', // RAVE
    '0x7d5121505149065b562c789a0145ed750e6e8cdd', // VR
    '0xb1d1eae60eea9525032a6dcb4c1ce336a1de71be', // DRV
    '0xD9343a049D5DBd89CD19DC6BcA8c48fB3a0a42a7', // LUMIA
    '0x1b379a79c91a540b2bcd612b4d713f31de1b80cc', // NAORIS
    '0xa27ec0006e59f245217ff08cd52a7e8b169e62d2', // AZTEC
    '0x6f40d4a6237c257fff2db00fa0510deeecd303eb', // FLUID
    '0x07041776f5007aca2a54844f50503a18a72a8b68', // USAT
    '0x0e397938c1aa0680954093495b70a9f5e2249aba', // QQQON
    '0xfedc5f4a6c38211c1338aa411018dfaf26612c08', // SPYON
    '0x8de39b057cc6522230ab19c0205080a8663331ef', // WOJAK
    '0xa3ee21c306a700e682abcdfe9baa6a08f3820419', // CTC
    '0xba47214edd2bb43099611b208f75e4b42fdcfedc', // GOOGLON
  ],
  tron: [
    nullAddress,
    ADDRESSES.tron.USDT, // USDT
    ADDRESSES.tron.USDC,  // USDC
    // 'TFptbWaARrWTX5Yvy3gNG5Lm8BmhPx82Bt', //wbt
    ADDRESSES.tron.TUSD,
    'TThzxNRLrW2Brp9DcTQU8i4Wd9udCWEdZ3', // stUSDT
    'TUPM7K8REVzD2UdV4R5fe5M8XbnR2DdoJ6', // HTX
    'TPFqcBAaaUMCSVRCqPaQ9QnzKhmuoLR6Rc', //USD1
    'TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz', //USDD
    'TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4', // BTT
    'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7', // WIN
    'TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq', // NFT
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
    '0xa3f751662e282e83ec3cbc387d225ca56dd63d3a', //APEPE (Ape Pepe)
    '0xac0f66379a6d7801d7726d5a943356a172549adb', // GEOD
    '0x7bebd226154e865954a87650faefa8f485d36081', // ZIG
  ],
  algorand: [],
  solana: [
    ADDRESSES.solana.USDC, // USDC
    ADDRESSES.solana.USDT, // USDT
    'gtBTCGWvSRYYoZpU9UZj6i3eUGUpgksXzzsbHk2K9So',
    '9PR7nCP9DpcUotnDPVLUBUZKu5WAYkwrCUx9wDnSpump', // ban
    '61V8vBaqAGMpgDQi4JcAwo1dmBGHsyhzodcPqnEVpump', //arc
    'FeR8VBqNRSUD5NtXAj2n3j1dAHkZHfyDktKuLXD4pump', //jelyjely
    'XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1', // CRCLX
    '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump', //fartcoin
    '9zNQRsGLjNKwCUU5Gq5LR8beUCPzQMVMqKAi3SSZh54u', //FDUSD
    'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB', //USD1
    'WLFinEv6ypjkczcS83FZqFpgFZYwQXutRbxGe7oC16g', //WLFI
    '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN', //TRUMP (OFFICIAL TRUMP)
    '2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH', //USDG (Global Dollar)
    ADDRESSES.solana.PUMP, //PUMP (pump.fun)
    'XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB', //TSLAX (Tesla xStock)
    'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof', //RENDER
    'Dz9mQ9NzkBcCsuGPFJ3r1bS4wgqKMHBPiVuniW8Mbonk', //USELESS
    '4eDf52YYzL6i6gbZ6FXqrLUPXbtP61f1gPSFM66M4XHe', //SOON
  ],
  bsc: [
    nullAddress,
    ADDRESSES.bsc.BTCB, // BTCB
    ADDRESSES.bsc.ETH, // BTCE
    '0xfd5840cd36d94d7229439859c0112a4185bc0255', // vUSDT
    ADDRESSES.bsc.BETH, // BETH
    '0x95c78222b3d6e262426483d42cfa53685a67ab9d', // vBUSD
    ADDRESSES.bsc.USDT, // BUSDT
    ADDRESSES.bsc.BUSD, // BUSD
    ADDRESSES.bsc.USDC, // B-USDC
    ADDRESSES.bsc.BTUSD, // B-TUSD
    '0x352Cb5E19b12FC216548a2677bD0fce83BaE434B', // BTT
    '0x02ff5065692783374947393723dba9599e59f591',// yoshi
    ADDRESSES.bsc.TUSD, //TUSD
    '0xa2120b9e674d3fc3875f415a7df52e382f141225', //ata
    '0x44ec807ce2f4a6f2737a92e985f318d035883e47', //HFT
    ADDRESSES.ethereum.FDUSD, //FDUSD
    '0xeac9873291ddaca754ea5642114151f3035c67a2', //dcb
    '0xaaa9214f675316182eaa21c85f0ca99160cc3aaa', //qanx
    '0x47c454ca6be2f6def6f32b638c80f91c9c3c5949', //gfall
    '0xfe1d7f7a8f0bda6e415593a2e4f82c64b446d404', //blp
    '0xe9d78bf51ae04c7e1263a76ed89a65537b9ca903', // GMEX
    '0x59769630b236398c2471eb26e6a529448030d94f', //NKYC nonkyc exchange token
    '0x25d887ce7a35172c62febfd67a1856f20faebb00', //pepe
    '0x2024b9be6b03f2a57d3533ae33c7e1d0b0b4be47', //Bitcointry exchange token BTTY
    ADDRESSES.bsc.USD1, // USD1
    '0xc2d09cf86b9ff43cb29ef8ddca57a4eb4410d5f3',  //GTBTC
    '0xcf3232b85b43bca90e51d38cc06cc8bb8c8a3e36', //beat
    '0x208bf3e7da9639f1eaefa2de78c23396b0682025', // tag
    '0x8b194370825e37b33373e74a41009161808c1488', // velvet
    '0x0f0df6cb17ee5e883eddfef9153fc6036bdb4e37', // bas
    '0x7324c7C0d95CEBC73eEa7E85CbAac0dBdf88a05b', //XCN
    '0x6bdcce4a559076e37755a78ce0c06214e59e4444', //B (Bubblemaps)
    '0x7ec43cf65f1663f820427c62a5780b8f2e25593a', //LAB (LABUBU)
    '0xd955c9ba56fb1ab30e34766e252a97ccce3d31a6', //XPIN (XPIN Network)
    '0x2c3a8ee94ddd97244a93bc48298f97d2c412f7db', //AKE (Akedo Games)
    '0x0a8d6c86e1bce73fe4d0bd531e1a567306836ea5', //COAI (ChainOpera AI)
    '0x0c69199c1562233640e0db5ce2c399a88eb507c7', // CYS
    '0x000008d2175f9aeaddb2430c26f8a6f73c5a0000', // UP
    '0xed9ae3def8d6f052971bb8b6d1975ff267cf9aad', // BLUAI
    '0x40b8129b786d766267a7a118cf8c07e31cdb6fde', // UB
    '0x0e4f6209ed984b21edea43ace6e09559ed051d48', // ON
    '0xeccbb861c0dda7efd964010085488b69317e4444', // 龙虾 (Lobster)
    '0x7Ddc52c4De30e94Be3A6A0A2b259b2850f421989', // GOMINING
    '0x7c8217517ed4711fe2deccdfeffe8d906b9ae11f', // BLESS
    '0x5506599c722389a60580b5213ea1da60d64754a1', // ZEST
    '0x8C907e0a72C3d55627E853f4ec6a96b0C8771145', // ZIG
    '0x6ef2ffb38d64afe18ce782da280b300e358cfeaf', // ACU
    '0x3e5d4f8aee0d9b3082d5f6da5d6e225d17ba9ea0', // UAI
    '0x33d08d8c7a168333a85285a68c0042b39fc3741d', // AIOZ
    '0x783c3f003f172c6ac5ac700218a357d2d66ee2a2', // B2
    '0x0e63b9c287e32a05e6b9ab8ee8df88a2760225a9', // PIEVERSE
    '0x3b4de3c7855c03bb9f50ea252cd2c9fa1125ab07', // IDOL
    '0x6bf62ca91e397b5a7d1d6bce97d9092065d7a510', // CROSS
    '0x997a58129890bbda032231a52ed1ddc845fc18e1', // SIREN
    '0xc07e1300dc138601fa6b0b59f8d0fa477e690589', // Q
    '0x9558a9254890b2a8b057a789f413631b9084f4a3', // AIN
    '0x55ad16bd573b3365f43a9daeb0cc66a73821b4a5', // AIOT
  ],
  eos: [
    ["eosio.token", "EOS", "eos"],
    ["tethertether", "USDT", "tether"],
    ["core.vaulta", "A", "vaulta"],
  ],
  arbitrum: [
    nullAddress,
    ADDRESSES.arbitrum.USDC, // USDC
    ADDRESSES.arbitrum.USDT, // USDT
    ADDRESSES.arbitrum.DAI, // DAI
    '0x09e18590e8f76b6cf471b3cd75fe1a1a9d2b2c2b', //aidoge
    '0x088cd8f5ef3652623c22d48b1605dcfe860cd704', //vela
    ADDRESSES.arbitrum.LPT, //lpt
    '0x51fc0f6660482ea73330e414efd7808811a57fa2', //premia
    '0x25d887ce7a35172c62febfd67a1856f20faebb00', //pepe
    '0x25118290e6a5f4139381d072181157035864099d', // RAIN
    '0x1337420dED5ADb9980CFc35f8f2B054ea86f8aB1', // SQD
  ],
  base: [
    nullAddress,
    '0xc2d09cf86b9ff43cb29ef8ddca57a4eb4410d5f3',
    '0xacfe6019ed1a7dc6f7b508c02d1b04ec88cc21bf', //VVV (Venice Token)
    '0x1111111111166b7fe7bd91427724b487980afc69', // ZORA
    '0x1f16e03c1a5908818f47f6ee7bb16690b40d0671', // RECALL
    '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', // DEGEN
    '0x182fa643e5f29d5eca75e7b9cf9336a3fe4620b2', // O
    '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4', // TOSHI
    '0x532f27101965dd16442E59d40670FaF5eBB142E4', // BRETT
    '0x22af33fe49fd1fa80c7149773dde5890d3c76f3b', // BNKR
    '0x16ee7ecac70d1028e7712751e2ee6ba808a7dd92', // FUN
    '0xe0cd4cacddcbf4f36e845407ce53e87717b6601d', // ICNT
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
    ADDRESSES.linea.DAI, //dai bridge
    '0x23ee2343B892b1BB63503a4FAbc840E0e2C6810f', // WAXL
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
    "0x8f552a71efe5eefc207bf75485b356a0b3f01ec9", //usdc
  ],
  moonriver: [
    nullAddress,
  ],
  kava: [
    nullAddress,
    ADDRESSES.kava.USDt,
    ADDRESSES.kava.USDt, //USDT (kava EVM)
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
    'EQAIb6KmdfdDR7CN1GBqVJuP25iCnLKCvBlJ07Evuu2dzP5f', // USDe
    'EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS', // DOGS
    'EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT', // NOT
    'EQD-cvR0Nz6XAyRBvbhz-abTrRC6sI5tvHvvpeQraV9UAAD7', // CATI
  ],
  sui: [
    '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI', // SUI
    '0x99cc0e7834326ec6ac571421e9b8e042e9eb63062771c77ac592bd194180b5da::deagent_token::DEAGENT_TOKEN', // AIA
    '0x76a49ebaf991fa2d4cb6a352af14425d453fe2ba6802b5ed2361b227150b6689::take::TAKE', // TAKE
    '0xee962a61432231c2ede6946515beb02290cb516ad087bb06a731e922b2a5f57a::us::US', // US
    '0x9f854b3ad20f8161ec0886f15f4a1752bf75d22261556f14cc8d3a1c5d50e529::magma::MAGMA', // MAGMA
    '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP', // DEEP
    '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS', // CETUS
    '0x35169bc93e1fddfcf3a82a9eae726d349689ed59e4b065369af8789fe59f8608::mmt::MMT', // MMT
    '0xe1b45a0e641b9955a20aa0ad1c1f4ad86aad8afb07296d4085e349a50e90bdca::blue::BLUE', // BLUE
    '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL', // WAL
    '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC', // USDC
    '0x7262fb2f7a3a14c888c438a3cd9b912469a58cf60f367352c46584262e8299aa::ika::IKA', // IKA
    '0x8993129d72e733985f7f1a00396cbd055bad6f817fee36576ce483c8bbb8b87b::sudeng::SUDENG', // HIPPO
    '0x4c981f3ff786cdb9e514da897ab8a953647dae2ace9679e8358eec1e3e8871ac::dmc::DMC', // DMC
    '0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS', // NS
    '0x3a304c7feba2d819ea57c3542d68439ca2c386ba02159c740f7b406e592c62ea::haedal::HAEDAL', // HAEDAL
    '0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI', // LOFI
    '0xb45fcfcc2cc07ce0702cc2d229621e046c906ef14d9b25e8e4d25f6e8763fef7::send::SEND', // SEND
    '0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX', // NAVX
    '0xae00e078a46616bf6e1e6fb673d18dcd2aa31319a07c9bc92f6063363f597b4e::AXOL::AXOL', // AXOL
    '0x5d1f47ea69bb0de31c313d7acf89b890dbb8991ea8e03c6c355171f84bb1ba4a::turbos::TURBOS', // TURBOS
    '0x1a8f4bc33f8ef7fbc851f156857aa65d397a6a6fd27a7ac2ca717b51f2fd9489::alkimi::ALKIMI', // ALKIMI
    '0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA', // SCA
    '0x1ef4c0b20340b8c6a59438204467ca71e1e7cbe918526f9c2c6c5444517cd5ca::chirp::CHIRP', // CHIRP
    '0x706fa7723231e13e8d37dad56da55c027f3163094aa31c867ca254ba0e0dc79f::artfi::ARTFI', // ARTFI
  ],
  aptos: [
    ADDRESSES.aptos.APT,
    ADDRESSES.aptos.USDC,
    ADDRESSES.aptos.USDT,
    ADDRESSES.aptos.USDt,
    '0xee962a61432231c2ede6946515beb02290cb516ad087bb06a731e922b2a5f57a::us::US', // US
    ADDRESSES.aptos.USD1, // USD1
    '0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc', // KGEN
  ],
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
  klaytn: [nullAddress, ADDRESSES.klaytn.USDT_1,],
  hyperliquid: [
    nullAddress,
    ADDRESSES.hyperliquid.USDT0,
    ADDRESSES.hyperliquid.USDC,
  ],
  sei: [
    nullAddress,
    ADDRESSES.sei.USDC,
    ADDRESSES.sei.USDT,
    ADDRESSES.sei.USDC_Circle,
    ADDRESSES.sei.USDT0,
  ],
  monad: [
    nullAddress,
    ADDRESSES.monad.USDT,
    ADDRESSES.monad.USDC,
  ],
  plasma: [
    nullAddress,
    ADDRESSES.plasma.USDT0,
    ADDRESSES.plasma.WXPL,
  ],
  wc: [
    nullAddress,
    ADDRESSES.wc.WLD, //WLD (World Chain)
  ],
  abstract: [
    nullAddress,
    '0x12d3e796d1f625eb6131aeb670bcd210bbb0f903', //GUSD (Gate stablecoin)
  ],
  starknet: [
    nullAddress,
    ADDRESSES.starknet.STRK, // STRK
  ],
  xdc: [
    nullAddress,
    '0xfa2958cb79b0491cc627c1557f441ef849ca8eb1', // USDC
  ],
  hedera: [
    nullAddress,
    '0.0.456858', // USDC
  ],
  ripple: [
    nullAddress,
    '524C555344000000000000000000000000000000.rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De', // RLUSD
  ],
  merlin: [
    nullAddress,
    '0x5c46bFF4B38dc1EAE09C5BAc65872a1D8bc87378', // MERL
  ],
  taiko: [
    nullAddress,
    '0xA9d23408b9bA935c230493c40C73824Df71A0975', // TAIKO
  ],
  megaeth: [
    nullAddress,
    '0x28b7e77f82b25b95953825f1e3ea0e36c1c29861', // MEGA
  ],
  stable: [
    nullAddress,
    '0x0000000000000000000000000000000000001003', // gas-token ERC20 interface (USDT)
  ],
  shibarium: [
    nullAddress,
    '0x495eea66B0f8b636D441dC6a98d8F5C3D455C4c0', // SHIB (BONE-bridged)
  ],
  xlayer: [
    nullAddress,
    '0x4ae46a509F6b1D9056937BA4500cb143933D2dc8', //USDG 
    '0xB6CEceAB302E2E4948951eE7843FC24E92933061', //USDC
    ADDRESSES.stable.USDT0, //USD₮0
    '0x87b4a8176B3Df6b71e26CC095edcAf4Db07506B4', //PAYPAL USD
  ],
}

function cexExports(config) {
  // bitcoin can be passed as a key string (or { key }) that is looked up in the
  // bitcoin addressbook and converted to the appropriate export, e.g. bitcoin: 'korbit'
  let btcExport
  if (config.bitcoin !== undefined) {
    const btcKey = typeof config.bitcoin === 'string'
      ? config.bitcoin
      : (config.bitcoin && typeof config.bitcoin.key === 'string' ? config.bitcoin.key : undefined)
    if (btcKey) {
      const { getBTCExport } = require('./bitcoin-book/index.js')
      btcExport = getBTCExport(btcKey)
      config = { ...config }
      delete config.bitcoin
    }
  }

  const chains = Object.keys(config).filter(i => i !== 'bep2')
  const exportObj = {
    timetravel: false,
  }
  if (btcExport) exportObj.bitcoin = { tvl: btcExport }
  chains.forEach(chain => {
    let { tokensAndOwners, owners, tokens, blacklistedTokens, fungibleAssets } = config[chain]

    if (!tokensAndOwners && !tokens && chain !== 'solana') {
      tokens = defaultTokens[chain]
      if (!tokens) {
        // log(chain, 'Missing default token list, counting only native token balance',)
        tokens = [nullAddress]
      }
    }

    const options = { ...config[chain], owners, tokens, chain, blacklistedTokens }
    if (svmChainsSet.has(chain)) options.solOwners = owners // count native balances on all SVM chains
    if (chain === 'solana') {
      if (!options.blacklistedTokens) options.blacklistedTokens = []
      options.blacklistedTokens.push('rTCAfDDrTAiP2hxBdfRtqnVZ9SF9E9JaQn617oStvPF')
      options.onlyTrustedTokens = true
    }
    if (chain === 'ton') options.onlyWhitelistedTokens = true
    if (chain === 'aptos' && Array.isArray(fungibleAssets)) options.fungibleAssets = fungibleAssets
    exportObj[chain] = { tvl: async (api) => {
      // supports dynamic owners lists passed as a function
      const owners = typeof options.owners === 'function' ? await options.owners(api) : options.owners
      let tokens = options.tokens
      const binanceTokensOnChain = await getCEXTokensOnBinanceOnChain(chain)
      if (binanceTokensOnChain.length) {
        console.log(`Adding ${binanceTokensOnChain.length} Binance tokens on ${chain} to the token list.`)
        tokens = [...(options.tokens ?? []), ...binanceTokensOnChain]
      }
      const runtimeOptions = { ...options, owners, tokens, permitFailure: true } // while filling historical data, some tokens may not exist on the chain yet, so we permit failure
      if (chain === 'solana') runtimeOptions.solOwners = owners
      return sumTokensExport(runtimeOptions)(api)
    } }
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
