
const coreAssets = require('./coreAssets.json')
const nullAddress = '0x0000000000000000000000000000000000000000'

// Multichain bridge info: https://bridgeapi.anyswap.exchange/v2/serverInfo/all
// IBC info - https://github.com/PulsarDefi/IBC-Cosmos/blob/main/ibc_data.json
// O3swap - https://agg.o3swap.com/v1/tokens_all
// wanchain - https://wanscan.org/tokens
// chainge - https://openapi.chainge.finance/open/v1/base/getSupportTokens,https://openapi.chainge.finance/open/v1/base/getSupportChains
// TODO: get celer info
// Alexar info: https://api.axelarscan.io/cross-chain/tvl
// coingecko coins: https://api.coingecko.com/api/v3/coins/list?include_platform=true
// gravity bridge for IBC: https://api.mintscan.io/v2/assets/gravity-bridge
// carbon: https://api-insights.carbon.network/info/denom_gecko_map
// orbit brige: https://bridge.orbitchain.io/open/v1/api/monitor/rawTokenList

const unsupportedGeckoChains = ['aptos', 'terra2', 'terra', 'kujira']
const ibcChains = ['terra', 'terra2', 'crescent', 'osmosis', 'kujira', 'stargaze', 'juno', 'injective', 'cosmos', 'comdex',]
const caseSensitiveChains = [...ibcChains, 'solana', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano',]

const tokens = {
  null: nullAddress,
  matic: 'ethereum:0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  bat: 'ethereum:0x0d8775f648430679a709e98d2b0cb6250d2887ef',
  reth: 'ethereum:0xae78736cd615f374d3085123a210448e74fc6393',
  steth: 'ethereum:0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
  solana: 'solana:So11111111111111111111111111111111111111112',
  dai: 'ethereum:0x6b175474e89094c44da98b954eedeac495271d0f',
  usdt: 'ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7',
  usdc: 'ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ethereum: 'ethereum:' + nullAddress,
  weth: 'ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  busd: 'bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56',
  bsc: 'bsc:' + nullAddress,
  bnb: 'bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  link: 'ethereum:0x514910771af9ca656af840dff83e8264ecf986ca',
  wbtc: 'ethereum:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  wsteth: 'ethereum:0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
}
const tokensBare = {}
for (const [label, value] of Object.entries(tokens))
  tokensBare[label] = value.split(':')[1]

const transformTokens = {
  ethereum: {
    "0xFEEf77d3f69374f66429C91d732A244f074bdf74": "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0", // CVX FXS token
    "0xb8c77482e45f1f44de1745f52c74426c631bdd52": tokens.bnb, // BNB
    "0xeb637a9ab6be83c7f8c79fdaa62e1043b65534f0": "heco:0xcbd6cb9243d8e3381fea611ef023e17d1b7aedf0", // BXH
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": tokens.ethereum, // ETH -> WETH
    "0x18084fbA666a33d37592fA2633fD49a74DD93a88": "0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa", //tBTC
    "0xef779cf3d260dbe6177b30ff08b10db591a6dd9c": "0x0000000000085d4780B73119b644AE5ecd22b376", // kUSD
    "0x42ef9077d8e79689799673ae588e046f8832cb95": "0x0000000000085d4780B73119b644AE5ecd22b376", //fUSD
    "0xd3d13a578a53685b4ac36a1bab31912d2b2a2f36": tokens.ethereum, // tWETH
    "0x94671a3cee8c7a12ea72602978d1bb84e920efb2": "0x853d955aCEf822Db058eb8505911ED77F175b99e", // tFRAX
    "0x2fc6e9c1b2c07e18632efe51879415a580ad22e1": "0x6bea7cfef803d1e3d5f7c0103f7ded065644e197", // tGAMMA
    "0xeff721eae19885e17f5b80187d6527aad3ffc8de": "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", // tSNX
    "0xdc0b02849bb8e0f126a216a2840275da829709b0": "0x4104b135dbc9609fc1a9490e61369036497660c8", // tAPW
    "0x15a629f0665a3eb97d7ae9a7ce7abf73aeb79415": "0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050", // tTCR
    "0x808d3e6b23516967ceae4f17a5f9038383ed5311": "0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d", // tFOX
    "0xf49764c9c5d644ece6ae2d18ffd9f1e902629777": "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2", // tSUSHI
    "0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84": "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF", // tALCX
    "0xadf15ec41689fc5b6dca0db7c53c9bfe7981e655": "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0", // tFXS
    "0xc7d9c108d4e1dd1484d3e2568d7f74bfd763d356": "0x0000000000085d4780B73119b644AE5ecd22b376", // XSTUSD
    "0x65f7ba4ec257af7c55fd5854e5f6356bbd0fb8ec": "0x92d6c1e31e14520e676a687f0a93788b716beff5", // sDYDX
    "0x0a5e677a6a24b2f1a2bf4f3bffc443231d2fdec8": "bsc:0xb5102cee1528ce2c760893034a4603663495fd72", // USX
    "0x2163383C1F4E74fE36c50E6154C7F18d9Fd06d6f": "avax:0x75739a693459f33b1fbcc02099eea3ebcf150cbe",  // Elasticswap token
    "0x36f8d0d0573ae92326827c4a82fe4ce4c244cab6": "ethereum:0x028171bCA77440897B824Ca71D1c56caC55b68A3",  // Morpho-Aave Dai Stablecoin 
  },
  fantom: {
    // WFTM && FTM
    "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx": "0x4e15361fd6b4bb609fa63c81a2be19d873717870",
    "0x658b0c7613e890ee50b8c4bc6a3f41ef411208ad": tokens.ethereum,  // fETH
    // moo tokens
    "0xbf07093ccd6adfc3deb259c557b61e94c1f66945": "fantom:0xd6070ae98b8069de6b494332d1a1a81b6179d960",
    "0x0a03d2c1cfca48075992d810cc69bd9fe026384a": tokens.ethereum,
    "0x97927abfe1abbe5429cbe79260b290222fc9fbba": tokens.wbtc,
    "0x6dfe2aaea9daadadf0865b661b53040e842640f8": tokens.link,
    "0x920786cff2a6f601975874bb24c63f0115df7dc8": tokens.dai,
    "0x49c68edb7aebd968f197121453e41b8704acde0c": "fantom:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    // update below to binspirit when it lists on coingecko
    "0x7345a537a975d9ca588ee631befddfef34fd5e8f": "fantom:0x5Cc61A78F164885776AA610fb0FE1257df78E59B",

    "0xdbf31df14b66535af65aac99c32e9ea844e14501": "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d", // RenBTC
    "0x4a89338a2079a01edbf5027330eac10b615024e5": "fantom:0xad84341756bf337f5a0164515b1f6f993d194e1f", // USDL
    "0xc0d9784fdba39746919bbf236eb73bc015fd351d": "fantom:0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", // FTML
    "0xe3a486c1903ea794eed5d5fa0c9473c7d7708f40": "fantom:0xad84341756bf337f5a0164515b1f6f993d194e1f", // cUSD (revenent finance)
    "0x8cc97b50fe87f31770bcdcd6bc8603bc1558380b": "cronos:0x0804702a4e749d39a35fde73d1df0b1f1d6b8347", // single
    "0x95bf7e307bc1ab0ba38ae10fc27084bc36fcd605": tokens.usdc,
    "0xc5cd01e988cd0794e05ab80f2bcdbdf13ce08bd3": tokens.usdc, // nUSD -> USDC
    "0x7f620d7d0b3479b1655cefb1b0bc67fb0ef4e443": "fantom:0xf16e81dce15b08f326220742020379b855b87df9", // nICE -> ICE
  },
  csc: {
    [nullAddress]: 'ethereum:0x081f67afa0ccf8c7b17540767bbe95df2ba8d97f',
    '0xE6f8988d30614afE4F7124b76477Add79c665822': 'ethereum:0x081f67afa0ccf8c7b17540767bbe95df2ba8d97f',
  },
  avax: {
    "0xaf2c034c764d53005cc6cbc092518112cbd652bb": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    "0x9dEbca6eA3af87Bf422Cea9ac955618ceb56EfB4": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    "0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33": "avax:0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd",
    "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    "0x574679ec54972cf6d705e0a71467bb5bb362919d": "avax:0x5817d4f0b62a59b17f75207da1848c2ce75e7af4",
    "0x2f28add68e59733d23d5f57d94c31fb965f835d0": tokens.usdc, // sUSDC(Avalanche) -> USDC(Ethereum)
    "0xf04d3a8eb17b832fbebf43610e94bdc4fd5cf2dd": tokens.busd, // sBUSD(Avalanche) -> BUSD(BSC)
    "0x1b156c5c75e9df4caab2a5cc5999ac58ff4f9090": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    "0xd795d70ec3c7b990ffed7a725a18be5a9579c3b9": "avax:0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    "0xb6767518b205ea8b312d2ef4d992a2a08c2f2416": "avax:0xc7198437980c041c805a1edcba50c1ce5db95118",
    "0xaf9f33df60ca764307b17e62dde86e9f7090426c": "avax:0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
    "0x808d5f0a62336917da14fa9a10e9575b1040f71c": "avax:0x60781c2586d68229fde47564546784ab3faca982",
    "0x0665ef3556520b21368754fb644ed3ebf1993ad4": "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490",
    // update below to binspirit when it lists on coingecko
    "0x90a424754ad0d72cebd440faba18cdc362bfe70a": "heco:0xcbd6cb9243d8e3381fea611ef023e17d1b7aedf0", // BXH
  },
  bsc: {
    "0x0000000000000000000000000000000000000000": tokens.bnb, // BNB -> WBNB
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": tokens.bnb, // BNB -> WBNB
    "0xb7f8cd00c5a06c0537e2abff0b58033d02e5e094": "0x8e870d67f660d95d5be530380d0ec0bd388289e1", // PAX
    "0xa35d95872d8eb056eb2cbd67d25124a6add7455e": "0x123", // 2030FLOKI returns nonsense TVL
    "0x6ded0f2c886568fb4bb6f04f179093d3d167c9d7": "0x09ce2b746c32528b7d864a1e3979bd97d2f095ab", // DFL
    "0x2f28add68e59733d23d5f57d94c31fb965f835d0": tokens.usdc, // sUSDC(BSC) -> USDC(Ethereum)
    "0xce86f7fcd3b40791f63b86c3ea3b8b355ce2685b": "0xb4d930279552397bba2ee473229f89ec245bc365", // MahaDao
    "0xbb9858603b1fb9375f6df972650343e985186ac5": "bsc:0xc087c78abac4a0e900a327444193dbf9ba69058e", // Treat staked  BUSD-USDC Staked APE-LP as LP Token
    "0xc5fb6476a6518dd35687e0ad2670cb8ab5a0d4c5": "bsc:0x2e707261d086687470b515b320478eb1c88d49bb", // Treat staked  BUSD-USDT Staked APE-LP as LP Token
    "0x532197ec38756b9956190b845d99b4b0a88e4ca9": "0x1614f18fc94f47967a3fbe5ffcd46d4e7da3d787", // PAID
    "0x6d1b7b59e3fab85b7d3a3d86e505dd8e349ea7f3": "heco:0xcbd6cb9243d8e3381fea611ef023e17d1b7aedf0", // BXH
    "0x42586ef4495bb512a86cf7496f6ef85ae7d69a64": "polygon:0x66e8617d1df7ab523a316a6c01d16aa5bed93681", // SPICE
    "0x60d01ec2d5e98ac51c8b4cf84dfcce98d527c747": "0x9ad37205d608b8b219e6a2573f922094cec5c200", // iZi
    "0x0a3bb08b3a15a19b4de82f8acfc862606fb69a2d": "0x0a3bb08b3a15a19b4de82f8acfc862606fb69a2d", // iUSD
    "0xa8bb71facdd46445644c277f9499dd22f6f0a30c": tokens.bnb, //beltBNB -> wbnb
    "0x9cb73f20164e399958261c289eb5f9846f4d1404": "bsc:0x55d398326f99059ff775485246999027b3197955", // 4belt -> usdt
    "0x51bd63f240fb13870550423d208452ca87c44444": "bsc:0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", //beltBTC->
    "0xaa20e8cb61299df2357561c2ac2e1172bc68bc25": "bsc:0x2170ed0880ac9a755fd29b2688956bd959f933f8", //beltETH->
    "0x13ab6739368a4e4abf24695bf52959224367391f": "0x25f8087ead173b73d6e8b84329989a8eea16cf73", //YGG
    // ib tokens
    "0xd7d069493685a581d27824fc46eda46b7efc0063": tokens.bnb, //ibBNB
    "0x7c9e73d4c71dae564d41f78d56439bb4ba87592f": tokens.busd, //ibBUSD
    "0x158da805682bdc8ee32d52833ad41e74bb951e59": tokens.busd, //ibUSDT
    "0x08fc9ba2cac74742177e0afc3dc8aed6961c24e7": "bsc:0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", //ibBTCB
    "0xbff4a34a4644a113e8200d7f1d79b3555f723afe": tokens.ethereum, //ibETH
    "0x3282d2a151ca00bfe7ed17aa16e42880248cd3cd": "0x0000000000085d4780b73119b644ae5ecd22b376", //ibTUSD
    "0xf1be8ecc990cbcb90e166b71e368299f0116d421": "bsc:0x8f0528ce5ef7b51152a59745befdd91d97091d2f", //ibALPACA
    "0x772f317ec695ce20290b56466b3f48501ba81352": "bsc:0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71", //dEPX
    // "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B": tokens.ethereum, // BETH->WETH
    "0x3F847b01d4d498a293e3197B186356039eCd737F": "ethereum:0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D",  // Railgun
  },
  polygon: {
    "0x60d01ec2d5e98ac51c8b4cf84dfcce98d527c747": "0x9ad37205d608b8b219e6a2573f922094cec5c200", // IZI
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", //
    "0x2f28add68e59733d23d5f57d94c31fb965f835d0": tokens.usdc, // sUSDC(Polygon) -> USDC(Ethereum)
    "0x9fffb2f49adfc231b44ddcff3ffcf0e81b06430a": tokens.dai, // moUSD(Polygon) -> DAI
    "0xf04d3a8eb17b832fbebf43610e94bdc4fd5cf2dd": tokens.busd, // sBUSD(Polygon) -> BUSD(BSC)
    "0x8eb3771a43a8c45aabe6d61ed709ece652281dc9": "avax:0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // sUSDC.e(Polygon) -> USDC.e(Avalanche)
    "0x1ddcaa4ed761428ae348befc6718bcb12e63bfaa": tokens.usdc, // deUSDC
    "0x794baab6b878467f93ef17e2f2851ce04e3e34c8": "0x794baab6b878467f93ef17e2f2851ce04e3e34c8", // Yin
    "0x282d8efce846a88b159800bd4130ad77443fa1a1": "0x967da4048cd07ab37855c090aaf366e4ce1b9f48", //ocean
    "0x769434dca303597c8fc4997bf3dab233e961eda2": "0x70e8de73ce538da2beed35d14187f6959a8eca96", // xSGD
    "0x6d3cC56DFC016151eE2613BdDe0e03Af9ba885CC": "0x00000100F2A2bd000715001920eB70D229700085", // wTCAD
    "0xe4F7761b541668f88d04fe9F2E9DF10CA613aEf7": "0x00006100F7090010005F1bd7aE6122c3C2CF0090", // wTAUD
    "0x81A123f10C78216d32F8655eb1A88B5E9A3e9f2F": "0x00000000441378008ea67f4284a57932b1c000a5", // wTGBP
    "0xf826a91e8de52bc1baf40d88203e572dc2551aa3": "bsc:0x6421531af54c7b14ea805719035ebf1e3661c44a", // LEO
    "0x28cead9e4ff96806c79f4189ef28fc61418e2216": "bsc:0x1633b7157e7638c4d6593436111bf125ee74703f", // SPS
  },
  xdai: {
    "0x0000000000000000000000000000000000000000": tokens.dai,
    "0x678df3415fc31947da4324ec63212874be5a82f8": tokens.dai,
  },
  okexchain: {
    "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c": "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c"
  },
  heco: {
    "0xb6f4c418514dd4680f76d5caa3bb42db4a893acb": "bsc:0x250632378e573c6be1ac2f97fcdf00515d0aa91b",
    "0xhecozzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz": "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
    "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c": "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c",
    "0x3D760a45D0887DFD89A2F5385a236B29Cb46ED2a": tokens.dai,
    "0x9362Bbef4B8313A8Aa9f0c9808B80577Aa26B73B": tokens.usdc,
    "0xCe0A5CA134fb59402B723412994B30E02f083842": "0xc00e94cb662c3520282e6f5717214004a7f26888",
    "0x1Ee8382bE3007Bd9249a89f636506284DdEf6Cc0": "0x35a532d376ffd9a705d0bb319532837337a398e7",
    "0x40280e26a572745b1152a54d1d44f365daa51618": "bsc:0xba2ae424d960c26247dd6c32edc70b295c744c43",
    "0x5ee41ab6edd38cdfb9f6b4e6cf7f75c87e170d98": "0x0000000000085d4780b73119b644ae5ecd22b376",
    "0xA2F3C2446a3E20049708838a779Ff8782cE6645a": "bsc:0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe", // XRP
    "0x843Af718EF25708765a8E0942F89edEae1D88DF0": "bsc:0x3ee2200efb3400fabb9aacf31297cbdd1d435d47" // ADA
  },
  harmony: {
    "0xa9ce83507d872c5e1273e745abcfda849daa654f": "harmony:0xa9ce83507d872c5e1273e745abcfda849daa654f",
    "0xb12c13e66ade1f72f71834f2fc5082db8c091358": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", //avax
    "0xed0b4b0f0e2c17646682fc98ace09feb99af3ade": "0x123", // RVRS has rubbish price, setting it as 0
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1": tokens.dai // DAI
  },
  optimism: {
    "0x121ab82b49B2BC4c7901CA46B8277962b4350204": tokens.ethereum, // synapse WETH -> WETH
    "0x35D48A789904E9b15705977192e5d95e2aF7f1D3": "0x956f47f50a910163d8bf957cf5846d573e7f87ca", // FEI
    "0x67CCEA5bb16181E7b4109c9c2143c24a1c2205Be": "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0", // FRAX Share
    "0x2E3D870790dC77A83DD1d18184Acc7439A53f475": "0x853d955acef822db058eb8505911ed77f175b99e", // FRAX
    "0x0b5740c6b4a97f90eF2F0220651Cca420B868FfB": "0x0ab87046fbb341d058f17cbc4c1133f25a20a52f", // gOHM

    // optimismSynths
    "0xc5db22719a06418028a40a9b5e9a7c02959d0d08": "0xbbc455cb4f1b9e4bfc4b73970d360c8f032efee6",
    "0x298b9b95708152ff6968aafd889c6586e9169f1d": "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6"
  },
  moonriver: {
    "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c": "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c",
    "0xE3C7487Eb01C74b73B7184D198c7fBF46b34E5AF": "moonriver:0x98878B06940aE243284CA214f92Bb71a2b032B8A",
  },
  moonbeam: {
    '0x322E86852e492a7Ee17f28a78c663da38FB33bfb': '0x853d955aCEf822Db058eb8505911ED77F175b99e', // frax
    '0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9': tokens.usdc, // usdc.mad
    '0x8e70cD5B4Ff3f62659049e74b6649c6603A0E594': tokens.usdc, // usdt.mad
    '0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0': tokens.wbtc, // wtbc.mad
    '0xc234A67a4F840E61adE794be47de455361b52413': tokens.dai, // dai.mad
    '0x1d4C2a246311bB9f827F4C768e277FF5787B7D7E': 'moonriver:0x98878b06940ae243284ca214f92bb71a2b032b8a', // movr
    '0x0000000000000000000000000000000000000000': 'moonbeam:0xacc15dc74880c9944775448304b263d191c6077f', // GLMR -> WGLMR
    '0x5f6c5C2fB289dB2228d159C69621215e354218d7': 'moonbeam:0xacc15dc74880c9944775448304b263d191c6077f', // GLMR -> WGLMR
    '0x931715FEE2d06333043d11F658C8CE934aC61D0c': tokens.usdc, // usdc.wh
    '0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d': tokens.usdc, // xc usdt (native)
    '0xab3f0245B83feB11d15AAffeFD7AD465a59817eD': tokens.ethereum, // eth.wh
    '0xE57eBd2d67B462E9926e04a8e33f01cD0D64346D': tokens.wbtc, // wtbc.wh
    '0x692C57641fc054c2Ad6551Ccc6566EbA599de1BA': '0x4Fabb145d64652a948d72533023f6E7A623C7C53', // busd.wh
  },
  arbitrum: {
    "0x09ad12552ec45f82be90b38dfe7b06332a680864": "polygon:0xc3fdbadc7c795ef1d6ba111e06ff8f16a20ea539", // ADDy
    "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501": "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d", // renBTC
    "0x9ef758ac000a354479e538b8b2f01b917b8e89e7": "polygon:0x3dc7b06dd0b1f08ef9acbbd2564f8605b4868eea", // XDO
    "0x31635A2a3892dAeC7C399102676E344F55d20Da7": "0x09ce2b746c32528b7d864a1e3979bd97d2f095ab", //  DeFIL
    "0x4a717522566c7a09fd2774ccedc5a8c43c5f9fd2": "0x956f47f50a910163d8bf957cf5846d573e7f87ca", //  FEI
    "0x2913e812cf0dcca30fb28e6cac3d2dcff4497688": tokens.dai, //  nUSD
    "0x61a1ff55c5216b636a294a07d77c6f4df10d3b56": "0x52a8845df664d76c69d2eea607cd793565af42b8", // APEX
    "0x1addd80e6039594ee970e5872d247bf0414c8903": "arbitrum:0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258", // fsGLP to GLP
    "0x4e971a87900b931ff39d1aad67697f49835400b6": "arbitrum:0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258", // fGLP to GLP
  },
  fuse: {
    "0x0000000000000000000000000000000000000000": "0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d", // FUSE
    "0x0be9e53fd7edac9f859882afdda116645287c629": "0x970b9bb2c0444f5e81e9d0efb84c8ccdcdcaf84d", // FUSE
    "0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5": tokens.usdc, // USDC
    "0x94Ba7A27c7A95863d1bdC7645AC2951E0cca06bA": tokens.dai, // DAI
    "0xFaDbBF8Ce7D5b7041bE672561bbA99f79c532e10": tokens.usdc, // USDT
    "0xa722c13135930332Eb3d749B2F0906559D2C5b99": tokens.ethereum, // WETH
    "0x43b17749b246fd2a96de25d9e4184e27e09765b0": "0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202" // KYC
  },
  evmos: {
    "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82": tokens.usdc, // madUSDC
    "0x8d395AfFC1767141387ffF45aF88a074614E7Ccf": "0x18084fba666a33d37592fa2633fd49a74dd93a88", // tBTCv2
    "0xb1a8C961385B01C3aA782fba73E151465445D319": "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d", // renBTC
    "0xe46910336479F254723710D57e7b683F3315b22B": tokens.usdc, // ceUSDC
    "0x63743ACF2c7cfee65A5E356A4C4A005b586fC7AA": tokens.dai, // DAI
    "0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e": tokens.usdc, // madUSDT
    "0xb72A7567847abA28A2819B855D7fE679D4f59846": tokens.usdc, // ceUSDT
    "0x5842C5532b61aCF3227679a8b1BD0242a41752f2": tokens.ethereum, // WETH
    "0xF80699Dc594e00aE7bA200c7533a07C1604A106D": tokens.wbtc, // WBTC
    "0x28eC4B29657959F4A5052B41079fe32919Ec3Bd3": "0x853d955aCEf822Db058eb8505911ED77F175b99e", // madFRAX
    "0xE03494D0033687543a80c9B1ca7D6237F2EA8BD8": "0x853d955aCEf822Db058eb8505911ED77F175b99e" // FRAX
  },
  oasis: {
    "0x3223f17957ba502cbe71401d55a0db26e5f7c68f": tokens.ethereum, //WETH
    "0x4bf769b05e832fcdc9053fffbc78ca889acb5e1e": tokens.usdc, // USDT
    "0x6cb9750a92643382e020ea9a170abb83df05f30b": tokens.usdc, // USDT
    "0xdc19a122e268128b5ee20366299fc7b5b199c8e3": tokens.usdc, // USDT wormhole
    "0x94fbffe5698db6f54d6ca524dbe673a7729014be": tokens.usdc, // USDC
  },
  kcc: {
    "0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c": "avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c",
  },
  metis: {
    "0x0000000000000000000000000000000000000000": "0x9e32b13ce7f2e80a01932b42553652e053d6ed8e", // METIS
    "0x75cb093e4d61d2a2e65d8e0bbb01de8d89b53481": "0x9e32b13ce7f2e80a01932b42553652e053d6ed8e", // METIS
    "0x5801d0e1c7d977d78e4890880b8e579eb4943276": "bsc:0x5801d0e1c7d977d78e4890880b8e579eb4943276",
    "0x2692be44a6e38b698731fddf417d060f0d20a0cb": tokens.bnb,
    "0x12d84f1cfe870ca9c9df9785f8954341d7fbb249": tokens.busd, // bUSD
    "0xE253E0CeA0CDD43d9628567d097052B33F98D611": "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", // wAVAX
    "0xa9109271abcf0c4106ab7366b4edb34405947eed": "fantom:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // wFTM
    "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8": "bsc:0xad29abb318791d579433d831ed122afeaf29dcfe",
    "0x4b9D2923D875edF43980BF5dddDEde3Fb20fC742": "bsc:0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
    "0x67c10c397dd0ba417329543c1a40eb48aaa7cd00": "0x0f2d719407fdbeff09d87557abb7232601fd9f29", //SYN
    "0x226d8bfb4da78ddc5bd8fd6c1532c58e88f9fd34": "0xbc19712feb3a26080ebf6f2f7849b417fdd792ca", // BoringDAO
  },
  boba: {
    "0x0000000000000000000000000000000000000000": tokens.ethereum, // WETH
    "0xd203De32170130082896b4111eDF825a4774c18E": tokens.ethereum, // synapse wETH
    "0xf74195bb8a5cf652411867c5c2c5b8c2a402be35": tokens.dai, // DAI
    "0x461d52769884ca6235B685EF2040F47d30C94EB5": tokens.busd, // BUSD
    "0x7562f525106f5d54e891e005867bf489b5988cd9": "0x853d955acef822db058eb8505911ed77f175b99e", // FRAX
    "0x2f28add68e59733d23d5f57d94c31fb965f835d0": tokens.usdc, // sUSDC(Boba) -> USDC(Ethereum)
    "0xf04d3a8eb17b832fbebf43610e94bdc4fd5cf2dd": tokens.busd // sBUSD(Boba) -> BUSD(BSC)
  },
  boba_avax: {
    "0x126969743a6d300bab08F303f104f0f7DBAfbe20": "avax:0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // USDC.e
  },
  boba_bnb: {
    "0x9F98f9F312D23d078061962837042b8918e6aff2": "bsc:0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // USDC
  },
  findora: {
    "0xABc979788c7089B516B8F2f1b5cEaBd2E27Fd78b": tokens.bnb, // BNB token
    "0x008A628826E9470337e0Cd9c0C944143A83F32f3": "bsc:0x2170ed0880ac9a755fd29b2688956bd959f933f8", // ETH token
    "0x93EDFa31D7ac69999E964DAC9c25Cd6402c75DB3": "bsc:0x55d398326f99059ff775485246999027b3197955", // USDT token
    "0xdA33eF1A7b48beBbF579eE86DFA735a9529C4950": "bsc:0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC token
    "0xE80EB4a234f718eDc5B76Bb442653827D20Ebb2d": tokens.busd, // BUSD token
    "0x07EfA82E00E458ca3D53f2CD5B162e520F46d911": "bsc:0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c" //  WBTC token
  },
  milkomeda: {
    "0x5950F9B6EF36f3127Ea66799e64D0ea1f5fdb9D1": tokens.ethereum, // WETH
    "0x41eAFC40CD5Cb904157A10158F73fF2824dC1339": tokens.dai, // DAI
    "0xab58DA63DFDd6B97EAaB3C94165Ef6f43d951fb2": tokens.usdc, // USDT
    "0x48AEB7584BA26D3791f06fBA360dB435B3d7A174": tokens.wbtc, // WBTC
    "0x42110A5133F91B49E32B671Db86E2C44Edc13832": tokens.usdc, // sUSDC(Milkomeda) -> USDC
  },
  bittorrent: {
    "0xdb28719f7f938507dbfe4f0eae55668903d34a15": tokens.usdc, // USDT
    "0x935faa2fcec6ab81265b301a30467bbc804b43d3": tokens.usdc, // USDC
    "0x8d193c6efa90bcff940a98785d1ce9d093d3dc8a": "0xc669928185dbce49d2230cc9b0979be6dc797957", // BTT
    "0x17f235fd5974318e4e2a5e37919a209f7c37a6d1": "0x0c10bf8fcb7bf5412187a595ab97a3609160b5c6", // USDD
    "0xae17940943ba9440540940db0f1877f101d39e8b": tokens.usdc, // USDC
    "0x1249c65afb11d179ffb3ce7d4eedd1d9b98ad006": tokens.ethereum, // WETH
    "0xe887512ab8bc60bcc9224e1c3b5be68e26048b8b": tokens.usdc, // USDT
    "0xe467f79e9869757dd818dfb8535068120f6bcb97": "0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202", // KNC
    "0x9888221fe6b5a2ad4ce7266c7826d2ad74d40ccf": tokens.wbtc // WBTC
  },
  klaytn: {
    "0x5388ce775de8f7a69d17fd5caa9f7dbfee65dfce": "0x4576E6825B462b6916D2a41E187626E9090A92c6", // Donkey
    "0x0268dbed3832b87582b1fa508acf5958cbb1cd74": "bsc:0xf258f061ae2d68d023ea6e7cceef97962785c6c1", // IJM
    "0xd6dAb4CfF47dF175349e6e7eE2BF7c40Bb8C05A3": tokens.usdc, // USDT
    "0x168439b5eebe8c83db9eef44a0d76c6f54767ae4": tokens.dai, // pUSD
    "0xce40569d65106c32550626822b91565643c07823": tokens.dai, // KASH
    "0x210bc03f49052169d5588a52c317f71cf2078b85": tokens.busd, // kBUSD
  },
  nova: {
    "0x0000000000000000000000000000000000000000": "fantom:0x69D17C151EF62421ec338a0c92ca1c1202A427EC", // SNT
    "0x657a66332a65b535da6c5d67b8cd1d410c161a08": "fantom:0x69D17C151EF62421ec338a0c92ca1c1202A427EC", // SNT
    "0x1f5396f254ee25377a5c1b9c6bff5f44e9294fff": "fantom:0x04068da6c83afcfa0e13ba15a6696662335d5b75", // USDC
  },
  aurora: {
    "0x0000000000000000000000000000000000000000": tokens.ethereum, // Aurora gas -> WETH
    "0xda2585430fef327ad8ee44af8f1f989a2a91a3d2": "0x853d955aCEf822Db058eb8505911ED77F175b99e", // FRAX
    "0x07379565cd8b0cae7c60dc78e7f601b34af2a21c": tokens.dai, //  nUSD -> DAI
    "0x42cc1cbf253f89be6814a0f59f745b40b69b6220": "polygon:0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // sUSDC(Aurora) -> USDC(Polygon)
    "0xd5e98caeb396dabe5a102bb9256b552944e3401f": tokens.busd, // sBUSD(Aurora) -> BUSD(BSC)
    "0x274d83086C356E0cFc75933FBf838CA10A7E8274": tokens.ethereum,
  },
  cronos: {
    "0x065de42e28e42d90c2052a1b49e7f83806af0e1f": "0x123", // CRK token is mispriced
    "0x87EFB3ec1576Dec8ED47e58B832bEdCd86eE186e": "0x0000000000085d4780B73119b644AE5ecd22b376",
  },
  velas: {
    "0xe41c4324dCbD2926481101f8580D13930AFf8A75": "velas:0xc579D1f3CF86749E05CD06f7ADe17856c2CE3126", // WVLX
    "0xc9b3aA6E91d70f4ca0988D643Ca2bB93851F3de4": "fantom:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // FTM
    "0x300a8be53b4b5557f48620d578e7461e3b927dd0": "0xf56842af3b56fd72d17cb103f92d027bba912e89", // BAMBOO
    "0x9b6fbF0ea23faF0d77B94d5699B44062e5E747Ac": "bsc:0xd522a1dce1ca4b138dda042a78672307eb124cc2", // SWAPZ
    "0x8d9fB713587174Ee97e91866050c383b5cEE6209": "bsc:0x8d9fb713587174ee97e91866050c383b5cee6209" // SCAR
  },
  telos: {
    "0x0000000000000000000000000000000000000000": "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000", // WETH
    "0x017043607270ecbb440e20b0f0bc5e760818b3d8": tokens.busd, // sBUSD(Aurora) -> BUSD(BSC)
  },
  reichain: {
    "0xDD2bb4e845Bd97580020d8F9F58Ec95Bf549c3D9": tokens.busd, // killswitch busd -> busd token
    "0xf8ab4aaf70cef3f3659d3f466e35dc7ea10d4a5d": tokens.bnb // killswitch bnb -> bnb token
  },
  solana: {
    "9EaLkQrbjmbbuZG9Wdpo8qfNUEjHATJFSycEmw6f1rGX": tokens.solana,
  },
}

const ibcMappings = {
  // from crescent
  'ibc/CA1261224952DF089EFD363D8DBB30A8AB6D8CD181E60EE9E68E432F8DE14FE3': { coingeckoId: 'inter-stable-token', decimals: 6, },
  'ibc/5A76568E079A31FA12165E4559BA9F1E9D4C97F9C2060B538C84DCD503815E30': { coingeckoId: 'injective-protocol', decimals: 18, },
  "ibc/6F4968A73F90CF7DE6394BF937D6DF7C7D162D74D839C13F53B41157D315E05F": { coingeckoId: "terrausd", decimals: 6, },
  "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9": { coingeckoId: "cosmos", decimals: 6, },
  "ibc/4627AD2524E3E0523047E35BB76CC90E37D9D57ACF14F0FCBCEB2480705F3CB8": { coingeckoId: "terra-luna", decimals: 6, },
  "ibc/C950356239AD2A205DE09FDF066B1F9FF19A7CA7145EA48A5B19B76EE47E52F7": { coingeckoId: "graviton", decimals: 6, },
  "ibc/DBF5FA602C46392DE9F4796A0FC7D02F3A8A3D32CA3FAA50B761D4AA6F619E95": { coingeckoId: "gravity-bridge-weth", decimals: 18, },
  "ibc/CD01034D6749F20AAC5330EF4FD8B8CA7C40F7527AB8C4A302FBD2A070852EE1": { coingeckoId: "gravity-bridge-usdc", decimals: 6, },
  "ibc/F1806958CA98757B91C3FA1573ECECD24F6FA3804F074A6977658914A49E65A3": { coingeckoId: "axlweth", decimals: 18, },
  "ibc/BFF0D3805B50D93E2FA5C0B2DDF7E0B30A631076CD80BC12A48C0E95404B4A41": { coingeckoId: "axlusdc", decimals: 6, },
  "ibc/11F940BCDFD7CFBFD7EDA13F25DA95D308286D441209D780C9863FD4271514EB": { coingeckoId: "agoric", decimals: 6, },
  // 
  "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F": { coingeckoId: "axlusdc", decimals: 6, },
  'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': { coingeckoId: 'cosmos', decimals: 6, },
  'ibc/961FA3E54F5DCCA639F37A7C45F7BBE41815579EF1513B5AFBEFCFEB8F256352': { coingeckoId: 'cosmos', decimals: 6, },
  'ibc/799FDD409719A1122586A629AE8FCA17380351A51C1F47A80A1B8E7F2A491098': { coingeckoId: 'akash-network', decimals: 6, },
  'ibc/B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395': { coingeckoId: 'terra-luna', decimals: 6, },
  'ibc/DA59C009A0B3B95E0549E6BF7B075C8239285989FF457A8EDDBB56F10B2A6986': { coingeckoId: 'terra-luna-2', decimals: 6, },
  'ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B': { coingeckoId: 'osmosis', decimals: 6, },
  'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23': { coingeckoId: 'osmosis', decimals: 6, },
  'ibc/EA7DF7F779C7F14E07172E5713E07356B55F01496CA649DDE46CF8FBF1A8466D': { coingeckoId: 'osmosis', decimals: 6, },
  'ibc/F3AA7EF362EC5E791FE78A0F4CCC69FEE1F9A7485EB1A8CAB3F6601C00522F10': { coingeckoId: 'evmos', decimals: 18, },
  'ibc/EFF323CC632EC4F747C61BCE238A758EFDB7699C3226565F7C20DA06509D59A5': { coingeckoId: 'juno-network', decimals: 6, },
  'ibc/167E3D88D71B7D2F6308D3EF93FC3DD51932B2D9672D72B71418F61CBC5F5717': { coingeckoId: 'juno-network', decimals: 6, },
  'ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C': { coingeckoId: 'terrausd', decimals: 6, },
  'ibc/A358D7F19237777AF6D8AD0E0F53268F8B18AE8A53ED318095C14D6D7F3B2DB5': { coingeckoId: 'secret', decimals: 6, },
  'ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7': { coingeckoId: 'ethereum', decimals: 18, },
  'ibc/4F393C3FCA4190C0A6756CE7F6D897D5D1BE57D6CCB80D0BC87393566A7B6602': { coingeckoId: 'stargaze', decimals: 6, },
  'ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4': { coingeckoId: 'stargaze', decimals: 6, },
  'ibc/3607EB5B5E64DD1C0E12E07F077FF470D5BC4706AFCBC98FE1BA960E5AE4CE07': { coingeckoId: 'comdex', decimals: 6, },
  'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0': { coingeckoId: 'comdex', decimals: 6, },
  'ibc/9EC8A1701813BB7B73BFED2496009ABB2C8BF187E6CDFA788D77F68E08BC05CD': { coingeckoId: 'composite', decimals: 6, },
  'ibc/F2331645B9683116188EF36FC04A809C28BD36B54555E8705A37146D0182F045': { coingeckoId: 'tether', decimals: 6, },
  'ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF': { coingeckoId: 'tether', decimals: 6, },
  'ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4': { coingeckoId: 'usd-coin', decimals: 6, },
  'ibc/E1616E7C19EA474C565737709A628D6F8A23FF9D3E9A7A6871306CF5E0A5341E': { coingeckoId: 'usd-coin', decimals: 6, },
  'ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E': { coingeckoId: 'axelar', decimals: 6, },
  'ibc/C01154C2547F4CB10A985EA78E7CD4BA891C1504360703A37E1D7043F06B5E1F': { coingeckoId: 'axelar', decimals: 6, },
  // from injective
  'ibc/E7807A46C0B7B44B350DA58F51F278881B863EC4DCA94635DAB39E52C30766CB': { coingeckoId: 'chihuahua-token', decimals: 6, },
  'ibc/16618B7F7AC551F48C057A13F4CA5503693FBFF507719A85BC6876B8BD75F821': { coingeckoId: 'evmos', decimals: 18, },
  'ibc/B786E7CBBF026F6F15A8DA248E0F18C62A0F7A70CB2DABD9239398C8B5150ABB': { coingeckoId: 'persistence', decimals: 6, },
  'ibc/624BA9DD171915A2B9EA70F69638B2CEA179959850C1A586F6C485498F29EDD4': { coingeckoId: 'polkadot', decimals: 10, },
  'ibc/3FDD002A3A4019B05A33D324B2F29748E77AF501BEA5C96D1F28B2D6755F9F25': { coingeckoId: 'stride', decimals: 6, },
  // from kujira
  "ibc/B37E4D9FB5B30F3E1E20A4B2DE2A005E584C5C822C44527546556AE2470B4539": {coinGeckoId: "polkadot", decimals: 6, },
  "ibc/DADB399E742FCEE71853E98225D13E44E90292852CD0033DF5CABAB96F80B833": {coingeckoId: "binancecoin", decimals: 18, },
}

const fixBalancesTokens = {
  astar: {
    [nullAddress]: { coingeckoId: "astar", decimals: 18, },
    "0xcdb32eed99aa19d39e5d6ec45ba74dc4afec549f": { coingeckoId: "orcus-oru", decimals: 18, },
    "0xc5bcac31cf55806646017395ad119af2441aee37": { coingeckoId: "muuu", decimals: 18, },
    "0x6df98e5fbff3041105cb986b9d44c572a43fcd22": { coingeckoId: "alnair-finance-nika", decimals: 18, },
    "0x29F6e49c6E3397C3A84F715885F9F233A441165C": { coingeckoId: "origin-dollar", decimals: 18, },
    "0xdd90e5e87a2081dcf0391920868ebc2ffb81a1af": { coingeckoId: "wmatic", decimals: 18, },
    "0x257f1a047948f73158dadd03eb84b34498bcdc60": { coingeckoId: "kagla-finance", decimals: 18, },
    "0xc4335b1b76fa6d52877b3046eca68f6e708a27dd": { coingeckoId: "starlay-finance", decimals: 18, },
    "0xde2578edec4669ba7f41c5d5d2386300bcea4678": { coingeckoId: "arthswap", decimals: 18, },
    "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c": { coingeckoId: "ethereum", decimals: 18, },
    "0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52": { coingeckoId: "binancecoin", decimals: 18, },
    "0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4": { coingeckoId: "shiden", decimals: 18, },
    "0xad543f18cff85c77e140e3e5e3c3392f6ba9d5ca": { coingeckoId: "bitcoin", decimals: 8, },
    "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283": { coingeckoId: "tether", decimals: 6, },
    "0x430D50963d9635bBef5a2fF27BD0bDDc26ed691F": { coingeckoId: "tether", decimals: 6, },
    "0x19574c3c8fafc875051b665ec131b7e60773d2c9": { coingeckoId: "astar", decimals: 18, },
    "0xE511ED88575C57767BAfb72BfD10775413E3F2b0": { coingeckoId: "astar", decimals: 18, },// nASTR
    "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720": { coingeckoId: "astar", decimals: 18, },
    "0xEcC867DE9F5090F55908Aaa1352950b9eed390cD": { coingeckoId: "astar", decimals: 18, },
    "0xb361DAD0Cc1a03404b650A69d9a5ADB5aF8A531F": { coingeckoId: "emiswap", decimals: 18, },
    "0xC404E12D3466acCB625c67dbAb2E1a8a457DEf3c": { coingeckoId: "usd-coin", decimals: 6, }, // interest bearing USDC
    "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98": { coingeckoId: "usd-coin", decimals: 6, },
    "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb": { coingeckoId: "dai", decimals: 18, },
    "0x4dd9c468A44F3FEF662c35c1E9a6108B70415C2c": { coingeckoId: "dai", decimals: 18, },
    "0xDBd71969aC2583A9A20Af3FB81FE9C20547f30F3": { coingeckoId: "dai", decimals: 18, },  // aBaiUsdc
    "0x9914Bff0437f914549c673B34808aF6020e2B453": { coingeckoId: "dai", decimals: 18, },  // aDaiUsdc
    "0x347e53263F8fb843EC605A1577eC7C8c0cAC7a58": { coingeckoId: "dai", decimals: 18, },  // aBusdUsdc
    "0x02Dac4898B2c2cA9D50fF8D6a7726166CF7bCFD0": { coingeckoId: "dai", decimals: 18, },  // aUsdtUsdc
    "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E": { coingeckoId: "binance-usd", decimals: 18, },
    "0xb7aB962c42A8Bb443e0362f58a5A43814c573FFb": { coingeckoId: "binance-usd", decimals: 18, },
    "0x733ebcC6DF85f8266349DEFD0980f8Ced9B45f35": { coingeckoId: "bai-stablecoin", decimals: 18, }, // BAI
    "0x5271D85CE4241b310C0B34b7C2f1f036686A6d7C": { coingeckoId: "astriddao-token", decimals: 18, }, // ATID
    "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF": { coingeckoId: "polkadot", decimals: 10, },
    "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB": { coingeckoId: "jpy-coin", decimals: 18, },
  },
  arbitrum: {
    "0x93C15cd7DE26f07265f0272E0b831C5D7fAb174f": { coingeckoId: "liquid-finance", decimals: 18, },
    "0x5326e71ff593ecc2cf7acae5fe57582d6e74cff1": { coingeckoId: "arbitrum:0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258", decimals: 0, },
  },
  cardano: {
    "ADA": { coingeckoId: "cardano", decimals: 0, },
  },
  omax: {
    [nullAddress]: { coingeckoId: "omax-token", decimals: 18, },
    "0xfeBaBc6a9B2Ec46d6357879B8bf39B593F11A5B9": { coingeckoId: "omax-token", decimals: 18, },
  },
  defichain: {
    "DFI": { coingeckoId: "defichain", decimals: 0, },
    "DUSD": { coingeckoId: "decentralized-usd", decimals: 0, },
    "ETH": { coingeckoId: "ethereum", decimals: 0, },
    "BTC": { coingeckoId: "bitcoin", decimals: 0, },
    "USDC": { coingeckoId: "usd-coin", decimals: 0, },
    "USDT": { coingeckoId: "tether", decimals: 0, },
  },
  step: {
    '0xb58a9d5920af6ac1a9522b0b10f55df16686d1b6': { coingeckoId: "step-app-fitfi", decimals: 18, },
    '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d': { coingeckoId: "usd-coin", decimals: 6, },
    '0xfa9343c3897324496a05fc75abed6bac29f8a40f': { coingeckoId: "tether", decimals: 6, },
    '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b': { coingeckoId: "ethereum", decimals: 18, },
    '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73': { coingeckoId: "binancecoin", decimals: 18, },
  },
  velas: {
    "0x3611Fbfb06ffBcEf9Afb210f6Ace86742e6c14a4": { coingeckoId: "cardano", decimals: 6, },
  },
  functionx: {
    [nullAddress]: { coingeckoId: "fx-coin", decimals: 18 },
    "0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd": { coingeckoId: "fx-coin", decimals: 18, },
    "0xd567b3d7b8fe3c79a1ad8da978812cfc4fa05e75": { coingeckoId: "pundi-x-2", decimals: 18, },
    "0x5fd55a1b9fc24967c4db09c513c3ba0dfa7ff687": { coingeckoId: "pundi-x-purse", decimals: 18, },
    "0xeceeefcee421d8062ef8d6b4d814efe4dc898265": { coingeckoId: "tether", decimals: 6, },
  },
  clv: {
    "0x6d6ad95425fcf315c39fa6f3226471d4f16f27b3": { coingeckoId: "clover-finance", decimals: 18, },
    "0x1376C97C5c512d2d6F9173A9A3A016B6140b4536": { coingeckoId: "clover-finance", decimals: 18, },
    "0xA1c3767c93E7B51EcB445fDbae1494DfC654e524": { coingeckoId: "ethereum", decimals: 18, },
    "0x30bEBbC0b6b357945AC30660E025C1532B9C7804": { coingeckoId: "wrapped-bitcoin", decimals: 8, },
    "0xF91193A62879279d6b8f209f89b6418e3C0e5CBf": { coingeckoId: "tether", decimals: 6, },
    "0x4A52F069Cb00905d996A0d7B811D78e60b4cB09E": { coingeckoId: "usd-coin", decimals: 6, },
  },
  avax: {
    "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7": { coingeckoId: "avalanche-2", decimals: 18, },
    "0x9dEbca6eA3af87Bf422Cea9ac955618ceb56EfB4": { coingeckoId: "avalanche-2", decimals: 18, },
  },
  tron: {
    [nullAddress]: { coingeckoId: "tron", decimals: 6, },
    "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t": { coingeckoId: "tether", decimals: 6, },
    "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8": { coingeckoId: "usd-coin", decimals: 6, },
    "TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn": { coingeckoId: "usdd", decimals: 18, },
    "TVHH59uHVpHzLDMFFpUgCx2dNAQqCzPhcR": { coingeckoId: "justmoney-2", decimals: 8, },
    "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9": { coingeckoId: "bitcoin", decimals: 8, },
    "TR3DLthpnDdCGabhVDbD3VMsiJoCXY3bZd": { coingeckoId: "litecoin", decimals: 8, },
    "THbVQp8kMjStKNnf2iCY6NEzThKMK5aBHg": { coingeckoId: "dogecoin", decimals: 8, },
    "THb4CqiFdwNHsWsQCs4JhzwjMWys4aqCbF": { coingeckoId: "ethereum", decimals: 18, },
  },
  lachain: {
    "0x3a898D596840C6B6b586d722bFAdCC8c4761BF41": { coingeckoId: "latoken", decimals: 18, },
  },
  theta: {
    [nullAddress]: { coingeckoId: "theta-fuel", decimals: 18, },
    "0x4dc08b15ea0e10b96c41aec22fab934ba15c983e": { coingeckoId: "theta-fuel", decimals: 18, },
    "0x1336739b05c7ab8a526d40dcc0d04a826b5f8b03": { coingeckoId: "thetadrop", decimals: 18, },
  },
  telos: {
    "0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E": { coingeckoId: "telos", decimals: 18, },
  },
  zyx: {
    "0xc9e1aea009b0bae9141f3dc7523fb42fd48c8656": { coingeckoId: "zyx", decimals: 18, },
  },
  ubiq: {
    "0x1fa6a37c64804c0d797ba6bc1955e50068fbf362": { coingeckoId: "ubiq", decimals: 18, },
  },
  findora: {
    [nullAddress]: { coingeckoId: "findora", decimals: 18, },
    "0x0000000000000000000000000000000000001000": { coingeckoId: "findora", decimals: 18, },
    "0x2e8079e0fe49626af8716fc38adea6799065d7f7": { coingeckoId: "usd-coin", decimals: 6, },
    "0x0632baa26299c9972ed4d9affa3fd057a72252ff": { coingeckoId: "tether", decimals: 6, },
  },
  cosmos: {
    "uatom": { coingeckoId: "cosmos", decimals: 6, },
  },
  terra2: {
    "uluna": { coingeckoId: "terra-luna-2", decimals: 6, },
    "terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26": { coingeckoId: "astroport-fi", decimals: 6, },
  },
  crescent: {
    // token info - https://apigw-v2.crescent.network/asset/info
    "ubcre": { coingeckoId: "liquid-staking-crescent", decimals: 6, },
    "ucre": { coingeckoId: "crescent-network", decimals: 6, },
  },
  juno: {
    "ujuno": { coingeckoId: "juno-network", decimals: 6, },
  },
  osmosis: {
    "uion": { coingeckoId: "ion", decimals: 6, },
  },
  kujira: {
    "ukuji": { coingeckoId: "kujira", decimals: 6, },
    "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk": { coingeckoId: "usk", decimals: 6, },
    "factory/kujira1swkuyt08z74n5jl7zr6hx0ru5sa2yev5v896p6/local": {coingeckoId: "local-money", decimals: 6,},
  },
  injective: {
    "inj": { coingeckoId: "injective-protocol", decimals: 18, },
  },
  comdex: {
    "ucmdx": { coingeckoId: "comdex", decimals: 6, },
    // "uharbor": { coingeckoId: "comdex", decimals: 6, },
    "ucmst": { coingeckoId: "composite", decimals: 6, },
  },
  solana: {
    "6LNeTYMqtNm1pBFN8PfhQaoLyegAH8GD32WmHU9erXKN": { coingeckoId: "aptos", decimals: 8, },
    "EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o": { coingeckoId: tokens.dai, decimals: -10, },
    "eqKJTf1Do4MDPyKisMYqVaUFpkEFAs3riGF3ceDH2Ca": { coingeckoId: tokens.usdc, decimals: 0, },
    "FCqfQSujuPxy6V42UvafBhsysWtEq1vhjfMN1PUbgaxA": { coingeckoId: tokens.usdc, decimals: 2, },
    "DdFPRnccQqLD4zCHrBqdY95D6hvw6PLWp9DEXj1fLCL9": { coingeckoId: tokens.usdc, decimals: 3, },
    "8Yv9Jz4z7BUHP68dz8E8m3tMe6NKgpMUKn8KVqrPA6Fr": { coingeckoId: tokens.usdc, decimals: 3, },
    "Grk6b4UMRWkgyq4Y6S1BnNRF4hRgtnMFp7Sorkv6Ez4u": { coingeckoId: tokens.usdc, decimals: 3, },
    "8XSsNvaKU9FDhYWAv7Yc7qSNwuJSzVrXBNEk7AFiWF69": { coingeckoId: tokens.usdc, decimals: 3, },
    "8qJSyQprMC57TWKaYEmetUR3UUiTP2M3hXdcvFhkZdmv": { coingeckoId: tokens.usdt, decimals: 2, },
    "E77cpQ4VncGmcAXX16LHFFzNBEBb2U7Ar7LBmZNfCgwL": { coingeckoId: tokens.usdt, decimals: 3, },
    "Bn113WT6rbdgwrm12UJtnmNqGqZjY4it2WoUQuQopFVn": { coingeckoId: tokens.usdt, decimals: 3, },
    "FwEHs3kJEdMa2qZHv7SgzCiFXUQPEycEXksfBkwmS8gj": { coingeckoId: tokens.usdt, decimals: 3, },
    "5RpUwQ8wtdPCZHhu6MERp2RGrpobsbZ6MH5dDHkUjs2": { coingeckoId: tokens.busd, decimals: -10, },
    "PUhuAtMHsKavMTwZsLaDeKy2jb7ciETHJP7rhbKLJGY": { coingeckoId: 'usn', decimals: 9, },
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": { coingeckoId: 'bonk', decimals: 5, },
  },
  harmony: {
    "0x799a4202c12ca952cB311598a024C80eD371a41e": { coingeckoId: "harmony", decimals: 18, },
    "0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a": { coingeckoId: "harmony", decimals: 18, },
    "0xa9ce83507d872c5e1273e745abcfda849daa654f": { coingeckoId: "xjewel", decimals: 18, },
    "0xea589e93ff18b1a1f1e9bac7ef3e86ab62addc79": { coingeckoId: "viper", decimals: 18, },
  },
  bsc: {
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": { coingeckoId: "binancecoin", decimals: 18, },
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": { coingeckoId: "binancecoin", decimals: 18, },
    "0xEa7A82E0Bc636667AB5c65623cd1438370620c3E": { coingeckoId: "binancecoin", decimals: 18, },
    "0x8b04E56A8cd5f4D465b784ccf564899F30Aaf88C": { coingeckoId: "anchorust", decimals: 6, },
    "0x6A46d878401F46B4C7f665f065E0667580e031ec": { coingeckoId: "investin", decimals: 18, },
    "0xa4eF4b0B23C1fc81d3f9ecF93510e64f58A4A016": { coingeckoId: "1million-nfts", decimals: 18, },
    "0x37dfACfaeDA801437Ff648A1559d73f4C40aAcb7": { coingeckoId: "apyswap", decimals: 18, },
    "0x71be881e9c5d4465b3fff61e89c6f3651e69b5bb": { coingeckoId: "brz", decimals: 4, }, // BRZ Token
    "0x316622977073bbc3df32e7d2a9b3c77596a0a603": { coingeckoId: "brz", decimals: 18, }, // jarvis synthetic BRL
    "0x5b1a9850f55d9282a7c4bf23a2a21b050e3beb2f": { coingeckoId: "brz", decimals: 4, }, // BRZ 
    "0xdcecf0664c33321ceca2effce701e710a2d28a3f": { coingeckoId: "tether", decimals: 18, },
    "0x1ddcaa4ed761428ae348befc6718bcb12e63bfaa": { coingeckoId: "usd-coin", decimals: 18, },  // Debridge USDC
    "0x4268b8f0b87b6eae5d897996e6b845ddbd99adf3": { coingeckoId: "usd-coin", decimals: 6, },  // alexar USDC
    "0xE85aFCcDaFBE7F2B096f268e31ccE3da8dA2990A": { coingeckoId: "aBnBc-bad", decimals: 6, },  // HOTFIX: map aBnBc token to undefined
    "0xbb1aa6e59e5163d8722a122cd66eba614b59df0d": { coingeckoId: "aBnBb-bad", decimals: 6, },  // HOTFIX: map aBnBb token to undefined
    "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E": { coingeckoId: "floki", decimals: 9, },
  },
  oasis: {
    "0x21c718c22d52d0f3a789b752d4c2fd5908a8a733": { coingeckoId: "oasis-network", decimals: 18, },
    "0x5C78A65AD6D0eC6618788b6E8e211F31729111Ca": { coingeckoId: "oasis-network", decimals: 18, },
    "0x9e832CaE5d19e7ff2f0D62881D1E33bb16Ac9bdc": { coingeckoId: "oasis-network", decimals: 18, },
    "0x3223f17957Ba502cbe71401D55A0DB26E5F7c68F": { coingeckoId: "ethereum", decimals: 18, },
    "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8": { coingeckoId: "tether", decimals: 6, },
    "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844": { coingeckoId: "usd-coin", decimals: 6, },
    "0xe8a638b3b7565ee7c5eb9755e58552afc87b94dd": { coingeckoId: "usd-coin", decimals: 6, },
    "0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c": { coingeckoId: "usd-coin", decimals: 6, }, // USDC celer
  },
  celo: {
    "0x7d00cd74ff385c955ea3d79e47bf06bd7386387d": { coingeckoId: "mcelo", decimals: 18, },
    "0x918146359264c492bd6934071c6bd31c854edbc3": { coingeckoId: "mceur", decimals: 18, },
    "0xe273ad7ee11dcfaa87383ad5977ee1504ac07568": { coingeckoId: "moola-celo-dollars", decimals: 18, },
    "0x37f750B7cC259A2f741AF45294f6a16572CF5cAd": { coingeckoId: "usd-coin", decimals: 6, },
    "0x2a3684e9dc20b857375ea04235f2f7edbe818fa7": { coingeckoId: "usd-coin", decimals: 6, },
    "0xb70e0a782b058bfdb0d109a3599bec1f19328e36": { coingeckoId: "usd-coin", decimals: 18, },
    "0xcd7d7ff64746c1909e44db8e95331f9316478817": { coingeckoId: "usd-coin", decimals: 18, },
    "0x93db49be12b864019da9cb147ba75cdc0506190e": { coingeckoId: "usd-coin", decimals: 18, },
    "0xcfffe0c89a779c09df3df5624f54cdf7ef5fdd5d": { coingeckoId: "tether", decimals: 18, },
    "0x617f3112bf5397d0467d315cc709ef968d9ba546": { coingeckoId: "tether", decimals: 6, },
    "0xBAAB46E28388d2779e6E31Fd00cF0e5Ad95E327B": { coingeckoId: "wrapped-bitcoin", decimals: 8, },
    "0x122013fd7df1c6f636a5bb8f03108e876548b455": { coingeckoId: "ethereum", decimals: 18, },
    "0xe919f65739c26a42616b7b8eedc6b5524d1e3ac4": { coingeckoId: "ethereum", decimals: 18, },
    "0xed193c4e69f591e42398ef54dea65aa1bb02835c": { coingeckoId: "terrausd", decimals: 18, },
    "0x90ca507a5d4458a4c6c6249d186b6dcb02a5bccd": { coingeckoId: "dai", decimals: 18, },
    "0x02de4766c272abc10bc88c220d214a26960a7e92": { coingeckoId: "toucan-protocol-nature-carbon-tonne", decimals: 18, },
    "0x32a9fe697a32135bfd313a6ac28792dae4d9979d": { coingeckoId: "moss-carbon-credit", decimals: 18, },
    "0x66803fb87abd4aac3cbb3fad7c3aa01f6f3fb207": { coingeckoId: "ethereum", decimals: 18, },
  },
  kcc: {
    [nullAddress]: { coingeckoId: "kucoin-shares", decimals: 18, },
    "0x4446fc4eb47f2f6586f9faab68b3498f86c07521": { coingeckoId: "kucoin-shares", decimals: 18, },
    "0x2ca48b4eea5a731c2b54e7c3944dbdb87c0cfb6f": { coingeckoId: "mojitoswap", decimals: 18, },
    "0x0039f574ee5cc39bdd162e9a88e3eb1f111baf48": { coingeckoId: "tether", decimals: 18, },
    "0x980a5afef3d17ad98635f6c5aebcbaeded3c3430": { coingeckoId: "usd-coin", decimals: 18, },
    "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d": { coingeckoId: "binance-usd", decimals: 18, },
    "0xfa93c12cd345c658bc4644d1d4e1b9615952258c": { coingeckoId: "bitcoin", decimals: 18, }, // BTC-K
    "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c": { coingeckoId: "binancecoin", decimals: 18, },
    "0x00ee2d494258d6c5a30d6b6472a09b27121ef451": { coingeckoId: "staked-kcs", decimals: 18, },
  },
  near: {
    "token.jumbo_exchange.near": { coingeckoId: "jumbo-exchange", decimals: 18 },
    "token.paras.near": { coingeckoId: "paras", decimals: 18 },
    "marmaj.tkn.near": { coingeckoId: "marmaj", decimals: 18 },
    "linear-protocol.near": { coingeckoId: "linear-protocol", decimals: 24 },
    "token.pembrock.near": { coingeckoId: "pembrock", decimals: 18 },
    "token.burrow.near": { coingeckoId: "burrow", decimals: 18 },
    "token.marmaj.near": { coingeckoId: "marmaj", decimals: 18 },
  },
  cronos: {
    "0x0000000000000000000000000000000000000000": { coingeckoId: "crypto-com-chain", decimals: 18, },
    "0xca2503482e5D6D762b524978f400f03E38d5F962": { coingeckoId: "crypto-com-chain", decimals: 18, },
    "0x45c135c1cdce8d25a3b729a28659561385c52671": { coingeckoId: "alethea-artificial-liquid-intelligence-token", decimals: 18 },
    "0x39a65a74dc5a778ff93d1765ea51f57bc49c81b3": { coingeckoId: "akash-network", decimals: 6 },
    "0xbed48612bc69fa1cab67052b42a95fb30c1bcfee": { coingeckoId: "shiba-inu", decimals: 18 },
    // "0x1a8e39ae59e5556b56b76fcba98d22c9ae557396": { coingeckoId: "dogecoin", decimals: 8 },
    "0xb888d8dd1733d72681b30c00ee76bde93ae7aa93": { coingeckoId: "cosmos", decimals: 6 },
    "0x02dccaf514c98451320a9365c5b46c61d3246ff3": { coingeckoId: "dogelon-mars", decimals: 18 },
  },
  multivac: {
    "0x8E321596267a4727746b2F48BC8736DB5Da26977": { coingeckoId: "multivac", decimals: 18, },
    "0x2f9c74d3c42023c533437c9ee743d4a6329e78df": { coingeckoId: "tether", decimals: 6, },
    "0xea1199d50ee09fa8062fd9da3d55c6f90c1babd2": { coingeckoId: "usd-coin", decimals: 6, },
  },
  tomochain: {
    "0xB1f66997A5760428D3a87D68b90BfE0aE64121cC": { coingeckoId: "tomochain", decimals: 18, },
  },
  csc: {
    "0x398dcA951cD4fc18264d995DCD171aa5dEbDa129": { coingeckoId: "tether", decimals: 18, },
  },
  ethereumclassic: {
    [nullAddress]: { coingeckoId: "ethereum-classic", decimals: 18, },
    "0x82A618305706B14e7bcf2592D4B9324A366b6dAd": { coingeckoId: "ethereum-classic", decimals: 18, },
    "0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a": { coingeckoId: "ethereum-classic", decimals: 18, },
    "0x35e9A89e43e45904684325970B2E2d258463e072": { coingeckoId: "ethereum-classic", decimals: 18, }
  },
  klaytn: {
    [nullAddress]: { coingeckoId: "klay-token", decimals: 18 }, // Wrapped KLAY
    "0xd7a4d10070a4f7bc2a015e78244ea137398c3b74": { coingeckoId: "klay-token", decimals: 18 }, // Wrapped KLAY
    "0xfd844c2fca5e595004b17615f891620d1cb9bbb2": { coingeckoId: "klay-token", decimals: 18 }, // Wrapped KLAY
    "0xff3e7cf0c007f919807b32b30a4a9e7bd7bc4121": { coingeckoId: "klay-token", decimals: 18 }, // Wrapped KLAY
    "0xe4f05a66ec68b54a58b17c22107b02e0232cc817": { coingeckoId: "klay-token", decimals: 18 }, // Wrapped KLAY
    "0xf6f6b8bd0ac500639148f8ca5a590341a97de0de": { coingeckoId: "klay-token", decimals: 18 }, // Wrapped KLAY
    "0x57d1a61e4fd09fbf16e35b04959e94dcf2032974": { coingeckoId: "klay-token", decimals: 18 }, // Wrapped KLAY
    "0x9eaefb09fe4aabfbe6b1ca316a3c36afc83a393f": { coingeckoId: "ripple", decimals: 6 },
    "0xd6dab4cff47df175349e6e7ee2bf7c40bb8c05a3": { coingeckoId: "tether", decimals: 6 },
    "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654": { coingeckoId: "klayswap-protocol", decimals: 18 }, // KLAYSWAP
    "0x98a8345bb9d3dda9d808ca1c9142a28f6b0430e1": { coingeckoId: "ethereum", decimals: 18 },
    "0x981846be8d2d697f4dfef6689a161a25ffbab8f9": { coingeckoId: "wrapped-bitcoin", decimals: 8 },
    "0x608792deb376cce1c9fa4d0e6b7b44f507cffa6a": { coingeckoId: "usd-coin", decimals: 6 },
    "0x5c13e303a62fc5dedf5b52d66873f2e59fedadc2": { coingeckoId: "tether", decimals: 6 },
    "0xcb2c7998696ef7a582dfd0aafadcd008d03e791a": { coingeckoId: "dai", decimals: 18 },
    "0xac9c1e4787139af4c751b1c0fadfb513c44ed833": { coingeckoId: "binancecoin", decimals: 18 },
    "0xe2765f3721dab5f080cf14ace661529e1ab9ade7": { coingeckoId: "binance-usd", decimals: 18 },
    "0x45830b92443a8f750247da2a76c85c70d0f1ebf3": { coingeckoId: "avalanche-2", decimals: 18 },
    "0xfAA03A2AC2d1B8481Ec3fF44A0152eA818340e6d": { coingeckoId: "solana", decimals: 18 },
    "0x2b72d65941e657c1305b65fa330ffdde7b397239": { coingeckoId: "aave-usdc", decimals: 6 },
    "0x61fbbfd5416c45f297a8e69ba113789c75f8841c": { coingeckoId: "aave-usdc", decimals: 6 },
    "0x2eadfda6d830547b5168ba88c13d24156a026ce5": { coingeckoId: "aave-usdt", decimals: 6 },
    "0x98aedff55dcc2e7a7d1899b325d1680527dd2742": { coingeckoId: "aave-usdt", decimals: 6 },
    "0x2ff5371dad5c6ef76d55213b7c5a519f6654ba17": { coingeckoId: "aave-dai", decimals: 18 },
    "0xe9a88c33abf71c902f7581321d05e6516cbca761": { coingeckoId: "aave-dai", decimals: 18 },
    "0xd2137fdf10bd9e4e850c17539eb24cfe28777753": { coingeckoId: "krome-stablecoin-bad", decimals: 18 },
    "0xe06597d02a2c3aa7a9708de2cfa587b128bd3815": { coingeckoId: "neopin", decimals: 18 },
  },
  evmos: {
    "0x3F75ceabcdfed1aca03257dc6bdc0408e2b4b026": { coingeckoId: "diffusion", decimals: 18 },
    "0xd4949664cd82660aae99bedc034a0dea8a0bd517": { coingeckoId: "evmos", decimals: 18 },
  },
  hoo: {
    [nullAddress]: { coingeckoId: "hoo-token", decimals: 18 },
    "0x3eff9d389d13d6352bfb498bcf616ef9b1beac87": { coingeckoId: "hoo-token", decimals: 18 },
  },
  cube: {
    [nullAddress]: { coingeckoId: "cube-network", decimals: 18 },
    "0x9d3f61338d6eb394e378d28c1fd17d5909ac6591": { coingeckoId: "cube-network", decimals: 18 },
    // o3 swap bridged tokens
    "0x57EeA49Ec1087695274A9c4f341e414eb64328c2": { coingeckoId: "ethereum", decimals: 18 },
    "0x040eA5C10e6BA4Badb6c433A365cCC4968697230": { coingeckoId: "bitcoin", decimals: 18 },
    "0x79F1520268A20c879EF44d169A4E3812D223C6de": { coingeckoId: "tether", decimals: 18 },
    "0x00f0D8595797943c12605cD59bc0D9f63D750cCf": { coingeckoId: "usd-coin", decimals: 18 },
    "0x3a1F6e3E6F26E92bB0D07841EB68F8E84f39751E": { coingeckoId: "dai", decimals: 18 },
    "0xEe9801669C6138E84bD50dEB500827b776777d28": { coingeckoId: "o3-swap", decimals: 18 },

  },
  elastos: {
    [nullAddress]: { coingeckoId: "elastos", decimals: 18 },
    "0x517e9e5d46c1ea8ab6f78677d6114ef47f71f6c4": { coingeckoId: "elastos", decimals: 18 },
    "0x9f1d0ed4e041c503bd487e5dc9fc935ab57f9a57": { coingeckoId: "binance-usd", decimals: 18 },
  },
  energyweb: {
    "0x6b3bd0478DF0eC4984b168Db0E12A539Cc0c83cd": { coingeckoId: "energy-web-token", decimals: 18 },
  },
  milkomeda: {
    "0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9": { coingeckoId: "cardano", decimals: 18 },
    "0x4bf769b05e832fcdc9053fffbc78ca889acb5e1e": { coingeckoId: "binance-usd", decimals: 18 },
    "0x8c008BBA2Dd56b99f4A6aB276bE3a478cB075F0C": { coingeckoId: "blueshift", decimals: 18 } // BLUES
  },
  milkomeda_a1: {
    [nullAddress]: { coingeckoId: "algorand", decimals: 18 },
    "0xaF86E6c5Fd9dAf53e5100ed38BaB2572609fCA27": { coingeckoId: "algorand", decimals: 18 },
    "0xBc31960A049Fe10297Ed8432Fb61DD734fEAd4ea": { coingeckoId: "usd-coin", decimals: 6 }, // USDC
    "0x32564ae38E5DBf316958CE25A6aD2A2249EbCc2D": { coingeckoId: "tether", decimals: 6 }, // USDt
    "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f": { coingeckoId: "tether", decimals: 6 }, // multiUSDT
    "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D": { coingeckoId: "usd-coin", decimals: 6 }, // multiUSDC
    "0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73": { coingeckoId: "binance-usd", decimals: 18 }, // multiBUSD
    "0x522B61755b5FF8176B2931DA7bF1a5F9414Eb710": { coingeckoId: "tether", decimals: 6 }, // ceUSDT
    "0x2421db204968A367CC2C866CD057fA754Cb84EdF": { coingeckoId: "usd-coin", decimals: 6 }, // ceUSDC
    "0x8Dc0Dfa2AeC0d4410c8C60c5f9cD0CD37b05a06a": { coingeckoId: "binance-usd", decimals: 18 }, // ceBUSD
    "0x150d2421E09eEa31beaa68b7a248700EEcEda87a": { coingeckoId: "dai", decimals: 18 }, // ceDAI
    "0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055": { coingeckoId: "blueshift", decimals: 18 } // BLUES
  },
  ultron: {
    [nullAddress]: { coingeckoId: "ultron", decimals: 18 },
    "0x3a4f06431457de873b588846d139ec0d86275d54": { coingeckoId: "ultron", decimals: 18 },
    "0x2318bf5809a72aabadd15a3453a18e50bbd651cd": { coingeckoId: "ethereum", decimals: 18 },
    "0xd2b86a80a8f30b83843e247a50ecdc8d843d87dd": { coingeckoId: "bitcoin", decimals: 18 },
    "0xc7cac85c1779d2b8ada94effff49a4754865e2e4": { coingeckoId: "binance-usd", decimals: 18 },
    "0x97fdd294024f50c388e39e73f1705a35cfe87656": { coingeckoId: "tether", decimals: 6 },
    "0x3c4e0fded74876295ca36f62da289f69e3929cc4": { coingeckoId: "usd-coin", decimals: 6 },
  },
  bittorrent: {
    "0xca424b845497f7204d9301bd13ff87c0e2e86fcf": { coingeckoId: "usd-coin", decimals: 18 },
    "0x9b5f27f6ea9bbd753ce3793a07cba3c74644330d": { coingeckoId: "tether", decimals: 18 },
    "0x23181f21dea5936e24163ffaba4ea3b316b57f3c": { coingeckoId: 'bittorrent', decimals: 18, },
    "0xedf53026aea60f8f75fca25f8830b7e2d6200662": { coingeckoId: 'tron', decimals: 6, },
  },
  bitgert: {
    [nullAddress]: { coingeckoId: "bitrise-token", decimals: 18, },
    "0x0eb9036cbE0f052386f36170c6b07eF0a0E3f710": { coingeckoId: "bitrise-token", decimals: 18, },
    "0xc3b730dd10a7e9a69204bdf6cb5a426e4f1f09e3": { coingeckoId: "lunagens", decimals: 18 },
    "0x11203a00a9134db8586381c4b2fca0816476b3fd": { coingeckoId: "youngparrot", decimals: 18 },
  },
  echelon: {
    [nullAddress]: { coingeckoId: "echelon", decimals: 18, },
    "0xadEE5159f4f82a35B9068A6c810bdc6c599Ba6a8": { coingeckoId: "echelon", decimals: 18, },
  },
  rei: {
    "0x2545af3d8b11e295bb7aedd5826021ab54f71630": { coingeckoId: "rei-network", decimals: 18, },
    "0x988a631caf24e14bb77ee0f5ca881e8b5dcfcec7": { coingeckoId: "tether", decimals: 6, },
    "0x8059e671be1e76f8db5155bf4520f86acfdc5561": { coingeckoId: "wrapped-bitcoin", decimals: 8 },
    "0x5B07F2582d0Cc26E400D56266aeBB201c93560eD": { coingeckoId: "ethereum", decimals: 18 },
  },
  tombchain: {
    "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000": { coingeckoId: "tomb", decimals: 18, },
    "0x4200000000000000000000000000000000000108": { coingeckoId: "lif3", decimals: 18, },
    "0x4200000000000000000000000000000000000006": { coingeckoId: "fantom", decimals: 18, },
    "0x4200000000000000000000000000000000000101": { coingeckoId: "tomb-shares", decimals: 18, },
    "0x4200000000000000000000000000000000000100": { coingeckoId: "usd-coin", decimals: 6, },
    "0x4200000000000000000000000000000000000109": { coingeckoId: "lif3-lshare", decimals: 18, },
  },
  rsk: {
    "0x967f8799af07df1534d48a95a5c9febe92c53ae0": { coingeckoId: "rootstock", decimals: 18, },
    "0x542fda317318ebf1d3deaf76e0b632741a7e677d": { coingeckoId: "rootstock", decimals: 18, },
    "0x1d931bf8656d795e50ef6d639562c5bd8ac2b78f": { coingeckoId: "ethereum", decimals: 18, },
  },
  polis: {
    "0x6fc851b8d66116627fb1137b9d5fe4e2e1bea978": { coingeckoId: "polis", decimals: 18, },
  },
  kekchain: {
    [nullAddress]: { coingeckoId: "kekchain", decimals: 18, },
    "0x71ec0cb8f7dd4f4c5bd4204015c4c287fbdaa04a": { coingeckoId: "kekchain", decimals: 18, },
    "0x54Bd9D8d758AC3717B37b7DC726877a23afF1B89": { coingeckoId: "kekchain", decimals: 18, },
  },
  aptos: {
    "0x1::aptos_coin::AptosCoin": { coingeckoId: "aptos", decimals: 8, },
    "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T": { coingeckoId: "usd-coin", decimals: 6, }, // usdc on eth via wormhole
    "0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T": { coingeckoId: "tether", decimals: 6, }, // via wormhole
    "0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T": { coingeckoId: "wrapped-bitcoin", decimals: 8 }, // via wormhole
    "0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T": { coingeckoId: "ethereum", decimals: 8, }, // via wormhole
    "0xc91d826e29a3183eb3b6f6aa3a722089fdffb8e9642b94c5fcd4c48d035c0080::coin::T": { coingeckoId: "usd-coin", decimals: 6, }, // usdc on solana via wormhole
    "0x1000000fa32d122c18a6a31c009ce5e71674f22d06a581bb0a15575e6addadcc::usda::USDA": { coingeckoId: "usd-coin", decimals: 6, }, // USD-A
    "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC": { coingeckoId: "usd-coin", decimals: 6, }, // via LayerZero
    "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT": { coingeckoId: "tether", decimals: 6, }, // via LayerZero
    "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH": { coingeckoId: "ethereum", decimals: 6, }, // via LayerZero
    "0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T": { coingeckoId: "solana", decimals: 8, },
    "0x84d7aeef42d38a5ffc3ccef853e1b82e4958659d16a7de736a29c55fbbeb0114::staked_aptos_coin::StakedAptosCoin": { coingeckoId: "aptos", decimals: 8, },  // tortuga staked aptos
    "0xd11107bdf0d6d7040c6c0bfbdecb6545191fdf13e8d8d259952f53e1713f61b5::staked_coin::StakedAptos": { coingeckoId: "aptos", decimals: 8, },  // ditto staked aptos
    "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::BnbCoin": { coingeckoId: "binancecoin", decimals: 8, },  // Celer
    "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::BusdCoin": { coingeckoId: "binance-usd", decimals: 8, },  // Celer
    "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdcCoin": { coingeckoId: "usd-coin", decimals: 6, },  // Celer
    "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdtCoin": { coingeckoId: "tether", decimals: 6, },  // Celer
    "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::DaiCoin": { coingeckoId: "dai", decimals: 8, },  // Celer
    "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::WethCoin": { coingeckoId: "ethereum", decimals: 8, },  // Celer
    "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::WbtcCoin": { coingeckoId: "wrapped-bitcoin", decimals: 8, },  // Celer
    "0xd0b4efb4be7c3508d9a26a9b5405cf9f860d0b9e5fe2f498b90e68b8d2cedd3e::aptos_launch_token::AptosLaunchToken": { coingeckoId: "aptos-launch-token", decimals: 8, },
  },
  dogechain: {
    [nullAddress]: { coingeckoId: "dogecoin", decimals: 18, },
    "0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101": { coingeckoId: "dogecoin", decimals: 18, },
    "0x7b4328c127b85369d9f82ca0503b000d09cf9180": { coingeckoId: "dogechain", decimals: 18, },
    "0xBfbb7B1d22FF521a541170cAFE0C9A7F20d09c3B": { coingeckoId: "egod-the-savior", decimals: 0, },
    "0x1df5c9B7789BD1416d005C15A42762481C95eDC2": { coingeckoId: "dogetools", decimals: 18, },
    // all multichain bridged tokens
    "0x765277EebeCA2e31912C9946eAe1021199B39C61": { coingeckoId: "usd-coin", decimals: 6, },
    "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C": { coingeckoId: "dai", decimals: 18, },
    "0xB44a9B6905aF7c801311e8F4E76932ee959c663C": { coingeckoId: "ethereum", decimals: 18, },
    "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D": { coingeckoId: "tether", decimals: 6, },
    "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f": { coingeckoId: "wrapped-bitcoin", decimals: 8, },
    "0xf27Ee99622C3C9b264583dACB2cCE056e194494f": { coingeckoId: "frax", decimals: 18, },
    "0x97513e975a7fA9072c72C92d8000B0dB90b163c5": { coingeckoId: "frax-share", decimals: 18, },
    "0x332730a4F6E03D9C55829435f10360E13cfA41Ff": { coingeckoId: "binance-usd", decimals: 18, },
    "0xa649325aa7c5093d12d6f98eb4378deae68ce23f": { coingeckoId: "binancecoin", decimals: 18, },
    "0xb12c13e66AdE1F72f71834f2FC5082Db8C091358": { coingeckoId: "quickswap", decimals: 18, },
    "0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98": { coingeckoId: "matic-network", decimals: 18, },
    // all synapse bridged tokens
    "0x85C2D3bEBffD83025910985389aB8aD655aBC946": { coingeckoId: "usd-coin", decimals: 6, },
    "0xB3306f03595490e5cC3a1b1704a5a158D3436ffC": { coingeckoId: "dai", decimals: 18, },
    "0x9F4614E4Ea4A0D7c4B1F946057eC030beE416cbB": { coingeckoId: "ethereum", decimals: 18, },
    "0x7f8e71DD5A7e445725F0EF94c7F01806299e877A": { coingeckoId: "tether", decimals: 6, },
    "0xD0c6179c43C00221915f1a61f8eC06A5Aa32F9EC": { coingeckoId: "wrapped-bitcoin", decimals: 8, },
    "0x10D70831f9C3c11c5fe683b2f1Be334503880DB6": { coingeckoId: "frax", decimals: 18, },
    "0x1fC532187B4848d2F9c564531b776A4F8e11201d": { coingeckoId: "binancecoin", decimals: 18, },
    "0x7264610A66EcA758A8ce95CF11Ff5741E1fd0455": { coingeckoId: "canto-inu", decimals: 18, },
  },
  canto: {
    [nullAddress]: { coingeckoId: "canto", decimals: 18, },
    '0x826551890Dc65655a0Aceca109aB11AbDbD7a07B': { coingeckoId: "canto", decimals: 18, },
    "0x80b5a32e4f032b2a058b4f29ec95eefeeb87adcd": { coingeckoId: "usd-coin", decimals: 6, },
    "0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75": { coingeckoId: "tether", decimals: 6, },
    "0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503": { coingeckoId: "note", decimals: 18, },
    "0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687": { coingeckoId: "ethereum", decimals: 18, },
    "0xeceeefcee421d8062ef8d6b4d814efe4dc898265": { coingeckoId: "cosmos", decimals: 6, },
  },
  starknet: {
    '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8': { coingeckoId: "usd-coin", decimals: 6, },
    '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8': { coingeckoId: "tether", decimals: 6, },
    '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac': { coingeckoId: "wrapped-bitcoin", decimals: 8, },
    '0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3': { coingeckoId: "dai", decimals: 18, },
    '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7': { coingeckoId: "ethereum", decimals: 18, },
  },
  ontology_evm: {
    "0xd8bc24cfd45452ef2c8bc7618e32330b61f2691b": { coingeckoId: "ong", decimals: 18, },
  },
  zeniq: {
    [nullAddress]: { coingeckoId: "bsc:0x5b52bfb8062ce664d74bbcd4cd6dc7df53fd7233", decimals: 0, },
    "0x74DC1C4ec10abE9F5C8A3EabF1A90b97cDc3Ead8": { coingeckoId: "bsc:0x5b52bfb8062ce664d74bbcd4cd6dc7df53fd7233", decimals: 0, },
  },
  algorand: {
    1: { coingeckoId: "algorand", decimals: 6, },
    312769: { coingeckoId: "tether", decimals: 6, },
    31566704: { coingeckoId: "usd-coin", decimals: 6, },
    692085161: { coingeckoId: "algodao", decimals: 6, },
    724480511: { coingeckoId: "algodex", decimals: 6, },
    463554836: { coingeckoId: "algofund", decimals: 6, },
    230946361: { coingeckoId: "algogems", decimals: 6, },
    441139422: { coingeckoId: "algomint", decimals: 6, },
    465865291: { coingeckoId: "algostable", decimals: 6, },
    841126810: { coingeckoId: "algostable", decimals: 6, },
    511484048: { coingeckoId: "algostake", decimals: 2, },
    163650: { coingeckoId: "arcc", decimals: 6, },
    663905154: { coingeckoId: "bnext-b3x", decimals: 6, },
    342889824: { coingeckoId: "board", decimals: 6, },
    871930188: { coingeckoId: "bring", decimals: 6, },
    137020565: { coingeckoId: "buying", decimals: 2, },
    657291910: { coingeckoId: "carbon-credit", decimals: 0, },
    297995609: { coingeckoId: "choice-coin", decimals: 2, },
    571576867: { coingeckoId: "cosmic-champs", decimals: 6, },
    470842789: { coingeckoId: "defly", decimals: 6, },
    684649988: { coingeckoId: "gard", decimals: 6, },
    607591690: { coingeckoId: "glitter-finance", decimals: 6, },
    386192725: { coingeckoId: "gobtc", decimals: 8, },
    386195940: { coingeckoId: "goeth", decimals: 8, },
    793124631: { coingeckoId: "governance-algo", decimals: 6, },
    137594422: { coingeckoId: "headline", decimals: 6, },
    239444645: { coingeckoId: "kaafila", decimals: 0, },
    6547014: { coingeckoId: "meld-gold", decimals: 5, },
    403499324: { coingeckoId: "nexus-asa", decimals: 0, },
    559219992: { coingeckoId: "octorand", decimals: 6, },
    287867876: { coingeckoId: "opulous", decimals: 10, },
    27165954: { coingeckoId: "planetwatch", decimals: 6, },
    744665252: { coingeckoId: "ptokens-btc-2", decimals: 8, },
    2751733: { coingeckoId: "realio-network", decimals: 7, },
    300208676: { coingeckoId: "smile-coin", decimals: 6, },
    700965019: { coingeckoId: "vestige", decimals: 6, },
    792313023: { coingeckoId: "wrapped-sol", decimals: 9, },
    283820866: { coingeckoId: "xfinite-entertainment-token", decimals: 9, },
    226701642: { coingeckoId: "yieldly", decimals: 6, },
    444035862: { coingeckoId: "zone", decimals: 6, },
  },
  shiden: {
    "0x0f933dc137d21ca519ae4c7e93f87a4c8ef365ef": { coingeckoId: "shiden", decimals: 18 },
    "0xb4BcA5955F26d2fA6B57842655d7aCf2380Ac854": { coingeckoId: "emiswap", decimals: 18 },
    "0x765277EebeCA2e31912C9946eAe1021199B39C61": { coingeckoId: "ethereum", decimals: 18 },
    "0x332730a4f6e03d9c55829435f10360e13cfa41ff": { coingeckoId: "binancecoin", decimals: 18 },
    "0x65e66a61d0a8f1e686c2d6083ad611a10d84d97a": { coingeckoId: "binance-usd", decimals: 18 },
    "0x722377a047e89ca735f09eb7cccab780943c4cb4": { coingeckoId: "standard-protocol", decimals: 18 }
  },
  tezos: {
    // KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn: { coingeckoId: "tzbtc", decimals: 8 },
    tezos: { coingeckoId: "tezos", decimals: 0 },
    'KT1UpeXdK6AJbX58GJ92pLZVCucn2DR8Nu4b': { coingeckoId: "tezos", decimals: 6 },
    'KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH': { coingeckoId: "tezos", decimals: 6 },
    KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b: { coingeckoId: "plenty-dao", decimals: 18 },
    KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4: { coingeckoId: "tezos", decimals: 6 }, // this is ctez, ideally should be valued higher
    KT1Ha4yFVeyzw6KRAdkzq6TxDHB97KG4pZe8: { coingeckoId: "dogami", decimals: 5 },
    KT1JkoE42rrMBP9b2oDhbx6EUr26GcySZMUH: { coingeckoId: "kolibri-dao", decimals: 18 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-19": { coingeckoId: "wrapped-bitcoin", decimals: 8 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-17": { coingeckoId: "usd-coin", decimals: 6 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-11": { coingeckoId: "matic-network", decimals: 18 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-10": { coingeckoId: "chainlink", decimals: 18 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-1": { coingeckoId: "binance-usd", decimals: 18 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-20": { coingeckoId: "ethereum", decimals: 18 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-5": { coingeckoId: "dai", decimals: 18 },
    "KT19DUSZw7mfeEATrbWVPHRrWNVbNnmfFAE6": { coingeckoId: "paul-token", decimals: 18 },
    "KT1TgmD7kXQzofpuc9VbTRMdZCS2e6JDuTtc": { coingeckoId: "upsorber", decimals: 0 },
    "KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X": { coingeckoId: "smartlink", decimals: 3 },
    "KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8": { coingeckoId: "ethtez", decimals: 18 },
    KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ: { coingeckoId: "aave", decimals: 18 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-18": { coingeckoId: "tether", decimals: 6 },
    KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV: { coingeckoId: "kolibri-usd", decimals: 18 },
    KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9: { coingeckoId: "usdtez", decimals: 6 },
    KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW: { coingeckoId: "youves-uusd", decimals: 12 },
    KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn: { coingeckoId: "bitcoin", decimals: 8 }, // TODO: tzBTC is not coingecko, so marking it as btc
    'KT1XRPEPXBZK25R3HTZP2O1X7XDMMMFOCKNW-0': { coingeckoId: "youves-uusd", decimals: 12 },
    // 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW-1': { coingeckoId: 'youves-you-defi', decimals: 12, },  //uDEFI token - update gecko id here after adding in coin geckp
    KT1Xobej4mc6XgEjDoJoHtTKgbD1ELMvcQuL: { coingeckoId: "youves-you-governance", decimals: 12 },
    "KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW-2": { coingeckoId: "wrapped-bitcoin", decimals: 12 }, // youves BTC
    KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY: { coingeckoId: "ethereum", decimals: 18 }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-0": { coingeckoId: "ethereum", decimals: 18 }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-1": { coingeckoId: "wrapped-bitcoin", decimals: 8 }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-2": { coingeckoId: "usd-coin", decimals: 6 }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-3": { coingeckoId: "tether", decimals: 6 }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-4": { coingeckoId: "matic-network", decimals: 18 }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-5": { coingeckoId: "chainlink", decimals: 18 }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-6": { coingeckoId: "dai", decimals: 18 }, // plenty bridge
    "KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY-7": { coingeckoId: "binance-usd", decimals: 18 }, // plenty bridge
    "KT1XnTn74bUtxHfDtBmm2bGZAQfhPbvKWR8o": { coingeckoId: "tether", decimals: 6 }, // usdt on tezos
    "KT1F1mn2jbqQCJcsNgYKVAQjvenecNMY2oPK": { coingeckoId: "pixelpotus", decimals: 6 },
    "KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb": { coingeckoId: "quipuswap-governance-token", decimals: 6 },
    "KT1ErKVqEhG9jxXgUG2KGLW3bNM7zXHX8SDF": { coingeckoId: "unobtanium-tezos", decimals: 9 },
    "KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW": { coingeckoId: "hic-et-nunc-dao", decimals: 6 },
    "KT1XTxpQvo7oRCqp85LikEZgAZ22uDxhbWJv": { coingeckoId: "gif-dao", decimals: 9 },
    "KT1A5P4ejnLix13jtadsfV9GCnXLMNnab8UT": { coingeckoId: "kalamint", decimals: 10 },
    // "KT1XPFjZqCULSnqfKaaYy8hJjeY63UNSGwXg": { coingeckoId: "crunchy-dao", decimals: 8 },
    // "KT1BHCumksALJQJ8q8to2EPigPW6qpyTr7Ng": { coingeckoId: "crunchy-network", decimals: 8 },
    "KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd": { coingeckoId: "wrap-governance-token", decimals: 8 },
    "KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf": { coingeckoId: "stableusd", decimals: 6 },
    "KT1AEfeckNbdEYwaMKkytBwPJPycz7jdSGea": { coingeckoId: "staker-dao", decimals: 18 },
    "KT1BB1uMwVvJ1M3vVHXWALs1RWdgTp1rnXTR": { coingeckoId: "moneyhero", decimals: 8 },
    "KT19y6R8x53uDKiM46ahgguS6Tjqhdj2rSzZ": { coingeckoId: "instaraise", decimals: 9 },
  },
  hpb: {
    "0xBE05Ac1FB417c9EA435b37a9Cecd39Bc70359d31": { coingeckoId: "high-performance-blockchain", decimals: 18 }
  },
  godwoken: {
    "0xe934f463d026d97f6ce0a10215d0ac4224f0a930": { coingeckoId: "nervos-network", decimals: 18, }, // Wrapped CKB
    "0xC3b946c53E2e62200515d284249f2a91d9DF7954": { coingeckoId: "usd-coin", decimals: 6, }, // Wrapped USDC (ForceBridge from Ethereum)
    "0xA21B19d660917C1DE263Ad040Ba552737cfcEf50": { coingeckoId: "usd-coin", decimals: 18, }, // Wrapped USDC (ForceBridge from BSC)
    "0x07a388453944bB54BE709AE505F14aEb5d5cbB2C": { coingeckoId: "tether", decimals: 6, }, // Wrapped USDT (ForceBridge from Ethereum)
    "0x5C30d9396a97f2279737E63B2bf64CC823046591": { coingeckoId: "tether", decimals: 18, }, // Wrapped USDT (ForceBridge from BSC)
    "0x7818FA4C71dC3b60049FB0b6066f18ff8c720f33": { coingeckoId: "bitcoin", decimals: 8, }, // Wrapped BTC (ForceBridge from Ethereum)
    "0x3f8d2b24C6fa7b190f368C3701FfCb2bd919Af37": { coingeckoId: "bitcoin", decimals: 18, }, // Wrapped BTC (ForceBridge from BSC)
  },
  okexchain: {
    [nullAddress]: { coingeckoId: "oec-token", decimals: 18, },
  },
  godwoken_v1: {
    "0xc296f806d15e97243a08334256c705ba5c5754cd": { coingeckoId: "nervos-network", decimals: 18, }, // Wrapped CKB
    "0x7538c85cae4e4673253ffd2568c1f1b48a71558a": { coingeckoId: "nervos-network", decimals: 18, }, // pCKB
    "0x9E858A7aAEDf9FDB1026Ab1f77f627be2791e98A": { coingeckoId: "ethereum", decimals: 18, }, // ETH (via Forcebridge from ETH)
    "0xbadb9b25150ee75bb794198658a4d0448e43e528": { coingeckoId: "binancecoin", decimals: 18, }, // BNB (via Forcebridge from BSC)
    "0x82455018f2c32943b3f12f4e59d0da2faf2257ef": { coingeckoId: "wrapped-bitcoin", decimals: 8, }, // WBTC (via Forcebridge from ETH)
    "0xef2439e020509259fa603c34b35a81ffe676cfb4": { coingeckoId: "wrapped-bitcoin", decimals: 18, }, // BTCB (via Forcebridge from BSC)
    "0xB66954619363145a05eF835547449EB9050d82f6": { coingeckoId: "ethereum", decimals: 18, }, // WETH (Via Celer CBridge From ETH)
    "0x186181e225dc1Ad85a4A94164232bD261e351C33": { coingeckoId: "usd-coin", decimals: 6, }, // USDC (via Forcebridge from ETH
    "0xfa307cfdea89dc197a346c338a98ac85d517af6e": { coingeckoId: "usd-coin", decimals: 18, }, // USDC (via Forcebridge from BSC
    "0xdff2facdfe47c1d5b51f18231f900949f1d5988f": { coingeckoId: "tether", decimals: 18, }, // USDT (via Forcebridge from BSC
    "0x53bB26dc8C5EFC6c95C37155aCa487d1D043436a": { coingeckoId: "usd-coin", decimals: 6, }, // USDC (Via Celer CBridge From ETH)
    "0x2c9Fc6087875646112f66a3C92fEF2d158FAa76e": { coingeckoId: "dai", decimals: 18, }, // DAI (via Forcebridge from ETH)
    "0x317F8d18FB16E49a958Becd0EA72f8E153d25654": { coingeckoId: "dai", decimals: 18, }, // Dai (Via Celer CBridge From ETH)
    "0x8E019acb11C7d17c26D334901fA2ac41C1f44d50": { coingeckoId: "tether", decimals: 6, }, // USDT (via Forcebridge from ETH)
    "0x3c790b38f466514ffCB4230e7B2334e52B64c942": { coingeckoId: "tether", decimals: 6, }, // USDT (Via Celer CBridge From ETH)
    "0xcD7bC9fC617a4F82eC1c8359D1C8610B90e3B44C": { coingeckoId: "binance-usd", decimals: 18, }, // BUSD (Via Celer CBridge From BSC)
    "0x1C428a6539A40eC5Bb481631266a51cd19b233B1": { coingeckoId: "bitcoin", decimals: 8, }, // Wrapped BTC (Celer CBridge from ETH)
    "0xB44a9B6905aF7c801311e8F4E76932ee959c663C": { coingeckoId: "bitcoin", decimals: 8, }, // Wrapped BTC (MultiChain Bridge from ETH)
    "0x765277EebeCA2e31912C9946eAe1021199B39C61": { coingeckoId: "dai", decimals: 18, }, // DAI (via Multichain Bridge from ETH)
    "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D": { coingeckoId: "usd-coin", decimals: 6, }, // USDC (via Multichain Bridge from ETH)
    "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f": { coingeckoId: "tether", decimals: 6, }, // USDT (via Multichain Bridge from ETH)


  },
  waves: {
    "5UYBPpq4WoU5n4MwpFkgJnW3Fq4B1u3ukpK33ik4QerR": { coingeckoId: "binancecoin", decimals: 8 },
    DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p: { coingeckoId: "neutrino", decimals: 6 },
    Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on: { coingeckoId: "waves-exchange", decimals: 8 },
    "474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu": { coingeckoId: "ethereum", decimals: 8 },
    "34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ": { coingeckoId: "tether", decimals: 6 },
    "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS": { coingeckoId: "bitcoin", decimals: 8 },
    WAVES: { coingeckoId: "waves", decimals: 8 },
    "2Fh9m3dNQXycHdnytEaETN3P1gDT7ij5U4HjMqQBeaqN": { coingeckoId: "ftx-token", decimals: 8 },
    "4GZH8rk5vDmMXJ81Xqfm3ovFaczqMnQ11r7aELiNxWBV": { coingeckoId: "fantom", decimals: 8 },
    "3KhNcHo4We1G5EWps7b1e5DTdLgWDzctc8S6ynu37KAb": { coingeckoId: "curve-dao-token", decimals: 8 },
    GVxGPBtgVWMW1wHiFnfaCakbJ6sKgZgowJgW5Dqrd7JH: { coingeckoId: "shiba-inu", decimals: 2 },
    HcHacFH51pY91zjJa3ZiUVWBww54LnsL4EP3s7hVGo9L: { coingeckoId: "matic-network", decimals: 8 },
    "4YmM7mj3Av4DPvpNpbtK4jHbpzYDcZuY6UUnYpqTbzLj": { coingeckoId: "uniswap", decimals: 8 },
    "6QUVF8nVVVvM7do7JT2eJ5o5ehnZgXUg13ysiB9JiQrZ": { coingeckoId: "terra-luna", decimals: 8 },
    "7TMu26hAs7B2oW6c5sfx45KSZT7GQA3TZNYuCav8Dcqt": { coingeckoId: "aave", decimals: 8 },
    E4rss7qLUcawCvD2uMrbLeTMPGkX15kS3okWCbUhLNKL: { coingeckoId: "maker", decimals: 8 },
    HLckRcg7hJ3Syf3PrGftFijKqQMJipf81WY3fwvHCJbe: { coingeckoId: "crypto-com-chain", decimals: 8 },
    "8zUYbdB8Q6mDhpcXYv52ji8ycfj4SDX4gJXS7YY3dA4R": { coingeckoId: "dai", decimals: 6 },
    "8DLiYZjo3UUaRBTHU7Ayoqg4ihwb6YH1AfXrrhdjQ7K1": { coingeckoId: "binance-usd", decimals: 6 },
    "47cyc68FWJszCWEwMWVsD9CadjS2M1XtgANuRGbEW8UH": { coingeckoId: "cosmos", decimals: 8 },
    "2bbGhKo5C31iEiB4CwGuqMYwjD7gCA9eXmm51fe2v8vT": { coingeckoId: "chainlink", decimals: 8 },
    BLRxWVJWaVuR2CsCoTvTw2bDZ3sQLeTbCofcJv7dP5J4: { coingeckoId: "yearn-finance", decimals: 8 },
    A1uMqYTzBdakuSNDv7CruWXP8mRZ4EkHwmip2RCauyZH: { coingeckoId: "the-graph", decimals: 8 },
    "2thtesXvnVMcCnih9iZbJL3d2NQZMfzENJo8YFj6r5jU": { coingeckoId: "terrausd", decimals: 6 },
    "2GBgdhqMjUPqreqPziXvZFSmDiQVrxNuGxR1z7ZVsm4Z": { coingeckoId: "apecoin", decimals: 8 },
    Aug9ccbPApb1hxXSue8fHuvbyMf1FV1BYBtLUuS5LZnU: { coingeckoId: "decentraland", decimals: 8 },
    ATQdLbehsMrmHZLNFhUm1r6s14NBT5JCFcSJGpaMrkAr: { coingeckoId: "axie-infinity", decimals: 8 },
    "8YyrMfuBdZ5gtMWkynLTveRvGb6LJ4Aff9rpz46UUMW": { coingeckoId: "the-sandbox", decimals: 8 },
    EfwRV6MuUCGgAUchdsF4dDFnSpKrDW3UYshdaDy4VBeB: { coingeckoId: "enjincoin", decimals: 8 },
    "5zoDNRdwVXwe7DveruJGxuJnqo7SYhveDeKb8ggAuC34": { coingeckoId: "wrapped-bitcoin", decimals: 8 },
    DSbbhLsSTeDg5Lsiufk2Aneh3DjVqJuPr2M9uU1gwy5p: { coingeckoId: "vires-finance", decimals: 8 },
    // 'C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS': { coingeckoId: 'duck-egg', decimals: 8, },  // fix this with right coin gecko id
    "4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8": { coingeckoId: "waves-enterprise", decimals: 8 },
    // 'HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS': { coingeckoId: 'puzzle', decimals: 8, },  // fix this with right coin gecko id
    // 'D4TPjtzpsDEJFS1pUAkvh1tJJJMNWGcSrds9sveBoQka': { coingeckoId: 'race', decimals: 8, },
    // '3UHgFQECoynwC3iunYBnbhzmcCzC5gVnVZMv8Yw1bneK': { coingeckoId: 'east', decimals: 8, },
    "6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g": { coingeckoId: "neutrino-system-base-token", decimals: 8 },
    // 'DUk2YTxhRoAqMJLus4G2b3fR8hMHVh6eiyFx5r29VR6t': { coingeckoId: 'neutrino eur', decimals: 8, },
    Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT: { coingeckoId: "swop", decimals: 6 },
    "7LMV3s1J4dKpMQZqge5sKYoFkZRLojnnU49aerqos4yg": { coingeckoId: "enno-cash", decimals: 8 },
    "9sQutD5HnRvjM1uui5cVC4w9xkMPAfYEV8ymug3Mon2Y": { coingeckoId: "signaturechain", decimals: 8 },
    DHgwrRvVyqJsepd32YbBqUeDH4GJ1N984X8QoekjgH8J: { coingeckoId: "waves-community-token", decimals: 2 },
    // 'AbunLGErT5ctzVN8MVjb4Ad9YgjpubB8Hqb17VxzfAck': { coingeckoId: 'Waves World', decimals: 0, },
    HZk1mbfuJpmxU1Fs4AX5MWLVYtctsNcg6e2C6VKqK8zk: { coingeckoId: "litecoin", decimals: 8 },
    "6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ": { coingeckoId: "usd-coin", decimals: 6 }
  },
  songbird: {
    "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED": { coingeckoId: "songbird", decimals: 18 },
    "0xC348F894d0E939FE72c467156E6d7DcbD6f16e21": { coingeckoId: "flare-finance", decimals: 18 },
    "0x70Ad7172EF0b131A1428D0c1F66457EB041f2176": { coingeckoId: "canary-dollar", decimals: 18 }
  },
  energi: {
    "0x7A86173daa4fDA903c9A4C0517735a7d34B9EC39": { coingeckoId: "energi", decimals: 18 },
    "0xa55f26319462355474a9f2c8790860776a329aa4": { coingeckoId: "energi", decimals: 18 }
  },
  flare: {
    "0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d": { coingeckoId: "flare-networks", decimals: 18 },
  },
  nahmii: {
    "0x4200000000000000000000000000000000000006": { coingeckoId: "ethereum", decimals: 18 },
    "0x595DBA438a1bf109953F945437c1584319515d88": { coingeckoId: "nahmii", decimals: 15 }
  },
  curio: {
    "0x134EbAb7883dFa9D04d20674dd8A8A995fB40Ced": { coingeckoId: "curio-governance", decimals: 18 },
  },
  gochain: {
    "0xcC237fa0A4B80bA47992d102352572Db7b96A6B5": { coingeckoId: "gochain", decimals: 18 },
    "0x97a19aD887262d7Eca45515814cdeF75AcC4f713": { coingeckoId: "usd-coin", decimals: 6 },
    "0x67bBB47f6942486184f08a671155FCFA6cAd8d71": { coingeckoId: "fast-finance", decimals: 18 },
  },
  dfk: {
    "0xCCb93dABD71c8Dad03Fc4CE5559dC3D89F67a260": { coingeckoId: "defi-kingdoms", decimals: 18 },
    "0x77f2656d04E158f915bC22f07B779D94c1DC47Ff": { coingeckoId: "xjewel", decimals: 18 },
    "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f": { coingeckoId: "governance-ohm", decimals: 18 },
    "0x2Df041186C844F8a2e2b63F16145Bc6Ff7d23E25": { coingeckoId: "fantom", decimals: 18 },
    // "0xb57b60debdb0b8172bb6316a9164bd3c695f133a": { coingeckoId: "avalanche-2", decimals: 18 },
    // "0x3ad9dfe640e1a9cc1d9b0948620820d975c3803a": { coingeckoId: "usd-coin", decimals: 18 },
  },
  smartbch: {
    [nullAddress]: { coingeckoId: "bitcoin-cash", decimals: 18 },
    "0x3743ec0673453e5009310c727ba4eaf7b3a1cc04": { coingeckoId: "bitcoin-cash", decimals: 18 },
    "0x0b00366fBF7037E9d75E4A569ab27dAB84759302": { coingeckoId: "law", decimals: 18 },
    "0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72": { coingeckoId: "flex-usd", decimals: 18 },
    "0x24d8d5Cbc14FA6A740c3375733f0287188F8dF3b": { coingeckoId: "tropical-finance", decimals: 18 },
    "0xBc2F884680c95A02cea099dA2F524b366d9028Ba": { coingeckoId: "tether", decimals: 18 },
    "0x265bD28d79400D55a1665707Fa14A72978FA6043": { coingeckoId: "cashcats", decimals: 2 },
  },
  palm: {
    "0x4c1f6fcbd233241bf2f4d02811e3bf8429bc27b8": { coingeckoId: "dai", decimals: 18 },
    "0x726138359c17f1e56ba8c4f737a7caf724f6010b": { coingeckoId: "ethereum", decimals: 18 }
  },
  syscoin: {
    "0xd3e822f3ef011Ca5f17D82C956D952D8d7C3A1BB": { coingeckoId: "syscoin", decimals: 18 }
  },
  vision: {
    "0x1Db6Cdc620388a0b6046B20CD59503a0839AdCFF": { coingeckoId: "tether", decimals: 18 },
    "0x79ffbC4fff98b821D59dbD7B33f91a2783006b6f": { coingeckoId: "vision-metaverse", decimals: 6 }
  },
  kava: {
    [nullAddress]: { coingeckoId: "kava", decimals: 18 },
    "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b": { coingeckoId: "kava", decimals: 18 },
    "0x332730a4F6E03D9C55829435f10360E13cfA41Ff": { coingeckoId: "binance-usd", decimals: 18 },
    "0x472402d47Da0587C1cf515DAfbAFc7bcE6223106": { coingeckoId: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", decimals: 12 },  // USD k
    "0x65e66a61D0a8F1e686C2D6083ad611a10D84D97A": { coingeckoId: "binancecoin", decimals: 18 },
    "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f": { coingeckoId: "usd-coin", decimals: 6 },
    "0xB44a9B6905aF7c801311e8F4E76932ee959c663C": { coingeckoId: "tether", decimals: 6 },
    "0x765277EebeCA2e31912C9946eAe1021199B39C61": { coingeckoId: "dai", decimals: 18 },
    "0xeb466342c4d449bc9f53a865d5cb90586f405215": { coingeckoId: "usd-coin", decimals: 6 },
    "0x7f5373ae26c3e8ffc4c77b7255df7ec1a9af52a6": { coingeckoId: "tether", decimals: 6 },
    "0x5c7e299cf531eb66f2a1df637d37abb78e6200c7": { coingeckoId: "dai", decimals: 18 },
    "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b": { coingeckoId: "bitcoin", decimals: 8 },
    "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D": { coingeckoId: "ethereum", decimals: 18 },
    "0xc13791DA84f43525189456CfE2026C60D3B7F706": { coingeckoId: "kava", decimals: 18 },
    "0x7c598c96d02398d89fbcb9d41eab3df0c16f227d": { coingeckoId: "sushi", decimals: 18 },
    "0xa0eeda2e3075092d66384fe8c91a1da4bca21788": { coingeckoId: "ethereum:0xef53462838000184f35f7d991452e5f25110b207", decimals: 0 },
    "0xea616011e5ac9a5b91e22cac59b4ec6f562b83f9": { coingeckoId: "bitrise-token", decimals: 18, },
  },
  sx: {
    "0xaa99bE3356a11eE92c3f099BD7a038399633566f": { coingeckoId: "sx-network", decimals: 18 },
    "0xA173954Cc4b1810C0dBdb007522ADbC182DaB380": { coingeckoId: "ethereum", decimals: 18 },
    "0xe2aa35C2039Bd0Ff196A6Ef99523CC0D3972ae3e": { coingeckoId: "usd-coin", decimals: 6 },
    "0xfa6F64DFbad14e6883321C2f756f5B22fF658f9C": { coingeckoId: "matic-network", decimals: 18 },
    "0x53813CD4aCD7145A716B4686b195511FA93e4Cb7": { coingeckoId: "dai", decimals: 18 },
    "0x7Dc31a2FCBfbAd1ed4519111Fd33f78316BcBC81": { coingeckoId: "shark", decimals: 18 }
  },
  meter: {
    [nullAddress]: { coingeckoId: "meter", decimals: 18 },
    "0x5729cb3716a315d0bde3b5e489163bf8b9659436": { coingeckoId: "meter", decimals: 18 },
    "0x160361ce13ec33c993b5cca8f62b6864943eb083": { coingeckoId: "meter", decimals: 18 },
    "0xd86e243fc0007e6226b07c9a50c9d70d78299eb5": { coingeckoId: "usd-coin", decimals: 6 },
    "0x6abaedab0ba368f1df52d857f24154cc76c8c972": { coingeckoId: "meter-stable", decimals: 18 },
    "0x24aa189dfaa76c671c279262f94434770f557c35": { coingeckoId: "binance-usd", decimals: 18 },
    "0x75fd6f7edcc5e7a8100ead3d29ccd844153ef0f3": { coingeckoId: "theta-fuel", decimals: 18 },
    "0x5fa41671c48e3c951afc30816947126ccc8c162e": { coingeckoId: "tether", decimals: 6 }
  },
  callisto: {
    "0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a": { coingeckoId: "callisto", decimals: 18 },
    "0xbf6c50889d3a620eb42c0f188b65ade90de958c4": { coingeckoId: "tether", decimals: 18 },
    "0xccc766f97629a4e14b3af8c91ec54f0b5664a69f": { coingeckoId: "ethereum-classic", decimals: 18 },
    "0xcc208c32cc6919af5d8026dab7a3ec7a57cd1796": { coingeckoId: "ethereum", decimals: 18 },
    "0xccde29903e621ca12df33bb0ad9d1add7261ace9": { coingeckoId: "binancecoin", decimals: 18 },
    "0x9FaE2529863bD691B4A7171bDfCf33C7ebB10a65": { coingeckoId: "soy-finance", decimals: 18 },
  },
  thundercore: {
    "0x413cefea29f2d07b8f2acfa69d92466b9535f717": { coingeckoId: "thunder-token", decimals: 18 },
    "0x4f3c8e20942461e2c3bdd8311ac57b0c222f2b82": { coingeckoId: "tether", decimals: 6 },
    "0x6576bb918709906dcbfdceae4bb1e6df7c8a1077": { coingeckoId: "ethereum", decimals: 18 },
    "0x22e89898a04eaf43379beb70bf4e38b1faf8a31e": { coingeckoId: "usd-coin", decimals: 6 },
    "0xbeb0131d95ac3f03fd15894d0ade5dbf7451d171": { coingeckoId: "binance-usd", decimals: 18 },
  },
  conflux: {
    "0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b": { coingeckoId: "conflux-token", decimals: 18 },
    "0x1f545487c62e5acfea45dcadd9c627361d1616d8": { coingeckoId: "wrapped-bitcoin", decimals: 18 },
    "0xa47f43de2f9623acb395ca4905746496d2014d57": { coingeckoId: "ethereum", decimals: 18 },
    "0x6963efed0ab40f6c3d7bda44a05dcf1437c44372 ": { coingeckoId: "usd-coin", decimals: 18, },
    "0xfe97e85d13abd9c1c33384e796f10b73905637ce": { coingeckoId: "tether", decimals: 18, },
  },
  ethereum: {
    "0xf6b1c627e95bfc3c1b4c9b825a032ff0fbf3e07d": { coingeckoId: "jpyc", decimals: 18 },
    "0xa80505c408C4DEFD9522981cD77e026f5a49FE63": { coingeckoId: "neuy", decimals: 18 },
    "0x97fe22e7341a0cd8db6f6c021a24dc8f4dad855f": { coingeckoId: "jarvis-synthetic-british-pound", decimals: 18 },
    "0x0f83287ff768d1c1e17a42f44d644d7f22e8ee1d": { coingeckoId: "upper-swiss-franc", decimals: 18 },
    "0x9fcf418b971134625cdf38448b949c8640971671": { coingeckoId: "tether-eurt", decimals: 18 },
    "0x8751d4196027d4e6da63716fa7786b5174f04c15": { coingeckoId: "wrapped-bitcoin", decimals: 18 },
    "0xf56b164efd3cfc02ba739b719b6526a6fa1ca32a": { coingeckoId: "curio-governance", decimals: 18 },
    "0xb1c9bc94aCd2fAE6aABf4ffae4429B93512a81D2": { coingeckoId: "ariadne", decimals: 18 },
    "0x5067006f830224960fb419d7f25a3a53e9919bb0": { coingeckoId: "smartpad-2", decimals: 18 },
    "0x2e9d63788249371f1dfc918a52f8d799f4a38c94": { coingeckoId: "tokemak", decimals: 18 },
    "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2": { coingeckoId: "sushi", decimals: 18 },
    "0xcf0c122c6b73ff809c693db761e7baebe62b6a2e": { coingeckoId: "floki", decimals: 9 },
  },
  moonbeam: {
    // celer bridge
    "0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c": { coingeckoId: "tether", decimals: 6 },
    "0x6a2d262d56735dba19dd70682b39f6be9a931d98": { coingeckoId: "usd-coin", decimals: 6 },
    "0x6959027f7850adf4916ff5fdc898d958819e5375": { coingeckoId: "ethereum", decimals: 18 },
    "0x4edf8e0778967012d46968ceadb75436d0426f88": { coingeckoId: "bepro-network", decimals: 18 },
    "0xfa36fe1da08c89ec72ea1f0143a35bfd5daea108": { coingeckoId: "polkadot", decimals: 10 }, // Lido Staked DOT
  },
  moonriver: {
    "0xcb4a593ce512d78162c58384f0b2fd6e802c2c47": { coingeckoId: "bepro-network", decimals: 18 },
  },
  muuchain: {
    "0x875358f6194d7c622d6355455f3137cceb2955c4": { coingeckoId: "muu-inu", decimals: 18 },
  },
  iotex: {
    [nullAddress]: { coingeckoId: "iotex", decimals: 18 },
    '0xA00744882684C3e4747faEFD68D283eA44099D03': { coingeckoId: "iotex", decimals: 18 },
    "0x3fe04320885e6124231254c802004871be681218": { coingeckoId: "mcn-ventures", decimals: 18 },
    "0xe1ce1c0fa22ec693baca6f5076bcdc4d0183de1c": { coingeckoId: "elk-finance", decimals: 18 },
    "0x6fbcdc1169b5130c59e72e51ed68a84841c98cd1": { coingeckoId: "tether", decimals: 6 },
    "0x3cdb7c48e70b854ed2fa392e21687501d84b3afc": { coingeckoId: "tether", decimals: 6 },
    "0x3b2bf2b523f54c4e454f08aa286d03115aff326c": { coingeckoId: "usd-coin", decimals: 6 },
    "0xc04da3a99d17135857bb937d2fbb321d3b6c6a81": { coingeckoId: "usd-coin", decimals: 6 },
    "0x42C9255D5e522e83B16ea11a3BA04c2D3AfCA079": { coingeckoId: "tether", decimals: 18 },
    "0x037346E5a5722957Ac2cAb6ceb8c74fC18Cea91D": { coingeckoId: "usd-coin", decimals: 18 },
    '0x84abcb2832be606341a50128aeb1db43aa017449': { coingeckoId: "binance-usd", decimals: 18 },
    '0xacee9b11cd4b3f57e58880277ac72c8c41abe4e4': { coingeckoId: "iobusd", decimals: 18 },
    '0x62a9d987cbf4c45a550deed5b57b200d7a319632': { coingeckoId: "dai", decimals: 18 },
    '0x1CbAd85Aa66Ff3C12dc84C5881886EEB29C1bb9b': { coingeckoId: "dai", decimals: 18 },
    '0xd6070ae98b8069de6b494332d1a1a81b6179d960': { coingeckoId: "xdollar-stablecoin", decimals: 18 },
    '0xec690cdd448e3cbb51ed135df72301c3265a8f80': { coingeckoId: "xdollar-stablecoin", decimals: 18 },
    '0x4d7b88403aa2f502bf289584160db01ca442426c': { coingeckoId: "cyclone-protocol", decimals: 18 },
    '0x0258866edaf84d6081df17660357ab20a07d0c80': { coingeckoId: "ethereum", decimals: 18 },
    '0xc7b93720f73b037394ce00f954f849ed484a3dea': { coingeckoId: "wrapped-btcoin", decimals: 8 },
    '0x17df9fbfc1cdab0f90eddc318c4f6fcada730cf2': { coingeckoId: "game-fantasy-token", decimals: 18 },
    '0x4752456e00def6025c77b55a88a2f8a1701f92f9': { coingeckoId: "metanyx", decimals: 18 },
    '0x490cfbf9b9c43633ddd1968d062996227ef438a9': { coingeckoId: "imagictoken", decimals: 18 },
    '0x97e6c48867fdc391a8dfe9d169ecd005d1d90283': { coingeckoId: "binancecoin", decimals: 18 },
    '0x86702a7f8898b172de396eb304d7d81207127915': { coingeckoId: "zoomswap", decimals: 18 },
    '0x8e66c0d6b70c0b23d39f4b21a1eac52bba8ed89a': { coingeckoId: "matic-network", decimals: 18 },
    '0x176CB5113b4885B3a194Bd69056AC3fE37A4b95c': { coingeckoId: "parrot-egg", decimals: 18 },
    '0x99b2b0efb56e62e36960c20cd5ca8ec6abd5557a': { coingeckoId: "crosschain-iotx", decimals: 18 },
  },
  polygon: {
    '0xfc40a4f89b410a1b855b5e205064a38fc29f5eb5': { coingeckoId: "rusd", decimals: 18 },
    '0x4c28f48448720e9000907bc2611f73022fdce1fa': { coingeckoId: "matic-network", decimals: 18 },
    '0x6CAcfaF65b1B1f9979aCF463a393A112D0980982': { coingeckoId: "matic-network", decimals: 18 },
    "0x14743e1c6f812154f7ecc980d890f0f5234103e7": { coingeckoId: "apyswap", decimals: 18, },
    '0x5c4b7ccbf908e64f32e12c6650ec0c96d717f03f': { coingeckoId: "binancecoin", decimals: 18 },
    '0xb4d09ff3da7f9e9a2ba029cb0a81a989fd7b8f17': { coingeckoId: "tether", decimals: 18 },
    '0x9c9e5fd8bbc25984b178fdce6117defa39d2db39': { coingeckoId: "binance-usd", decimals: 18 },
    '0x6002410dda2fb88b4d0dc3c1d562f7761191ea80': { coingeckoId: "0x123", decimals: 0 },
  },
  heco: {
    "0x90e8896b12a92D51CD213b681C2CaD83A9a6bD49": { coingeckoId: "apyswap", decimals: 18, },
  },
  tlchain: {
    "0x422b6cdf97c750a0edcddc39c88f25379e59e96e": { coingeckoId: "tlchain", decimals: 18, },
  },
  ronin: {
    '0xe514d9deb7966c8be0ca922de8a064264ea6bcd4': { coingeckoId: "ronin", decimals: 18 },
    '0x97a9107c1793bc407d6f527b77e7fff4d812bece': { coingeckoId: "axie-infinity", decimals: 18 },
    '0xa8754b9fa15fc18bb59458815510e40a12cd2014': { coingeckoId: "smooth-love-potion", decimals: 0 },
    '0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5': { coingeckoId: "ethereum", decimals: 18 },
    '0x0b7007c13325c48911f73a2dad5fa5dcbf808adc': { coingeckoId: "usd-coin", decimals: 6 },
  },
  arbitrum_nova: {
    [nullAddress]: { coingeckoId: "ethereum", decimals: 18 },
    '0x722E8BdD2ce80A4422E880164f2079488e115365': { coingeckoId: "ethereum", decimals: 18 },
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1': { coingeckoId: "dai", decimals: 18 },
    '0x52484e1ab2e2b22420a25c20fa49e173a26202cd': { coingeckoId: "tether", decimals: 6 },
    '0x750ba8b76187092b0d1e87e28daaf484d1b5273b': { coingeckoId: "usd-coin", decimals: 6 },
  },
  ethpow: {
    [nullAddress]: { coingeckoId: "ethereum-pow-iou", decimals: 18 },
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': { coingeckoId: "ethereum-pow-iou", decimals: 18 },
    '0x0c9f28FBdFd79f7C00B805d8c63D053c146d282c': { coingeckoId: "billionhappiness", decimals: 18 },
    '0x7bf88d2c0e32de92cdaf2d43ccdc23e8edfd5990': { coingeckoId: "ethereum-pow-iou", decimals: 18 },

    // Multichain
    '0x11bbB41B3E8baf7f75773DB7428d5AcEe25FEC75': { coingeckoId: "usd-coin", decimals: 6 },
    '0x8a496486f4c7cb840555bc2be327cba1447027c3': { coingeckoId: "tether", decimals: 6 },
    '0x5df101f56ea643e06066392d266e9f4366b9186d': { coingeckoId: "wrapped-bitcoin", decimals: 8 },
    '0xaf3ccfd9b59b36628cc2f659a09d6440795b2520': { coingeckoId: "ethereum", decimals: 18 },
    '0x312b15d6d531ea0fe91ddd212db8c0f37e4cc698': { coingeckoId: "dai", decimals: 18 },

    // chainge
    '0x2ad7868ca212135c6119fd7ad1ce51cfc5702892': { coingeckoId: "tether", decimals: 6 },
    '0x34a9c05b638020a07bb153bf624c8763bf8b4a86': { coingeckoId: "ethereum", decimals: 18 },
    '0xbd1563046a90f18127fd39f3481fd8d6ab22877f': { coingeckoId: "binancecoin", decimals: 18 },
    '0xf61eb8999f2f222f425d41da4c2ff4b6d8320c87': { coingeckoId: "binance-usd", decimals: 18 },
    '0x4bbd68d8b1f25ae7b460e3347c637fe9e7338e0c': { coingeckoId: "wrapped-bitcoin", decimals: 8 },
    '0x25de68ef588cb0c2c8f3537861e828ae699cd0db': { coingeckoId: "usd-coin", decimals: 6 },
    '0x0b35d852dcb8b59eb1e8d3182ebad4e96e2df8f0': { coingeckoId: "dai", decimals: 18 },
  },
  xdc: {
    '0xD4B5f10D61916Bd6E0860144a91Ac658dE8a1437': { coingeckoId: "tether", decimals: 6 },
    // '0xc6ae1db6c66d909f7bfeeeb24f9adb8620bf9dbf': { coingeckoId: "usd-coin", decimals: 6 },
    // '0x1289f70b8a16797cccbfcca8a845f36324ac9f8b': { coingeckoId: "ethereum", decimals: 18 },
    [nullAddress]: { coingeckoId: "xdce-crowd-sale", decimals: 18 },
    '0x951857744785e80e2de051c32ee7b25f9c458c42': { coingeckoId: "xdce-crowd-sale", decimals: 18 },
    '0x36726235dadbdb4658d33e62a249dca7c4b2bc68': { coingeckoId: "xswap-protocol", decimals: 18 },
    '0x5d5f074837f5d4618b3916ba74de1bf9662a3fed': { coingeckoId: "storx", decimals: 18 },
    '0xd04275e2fd2875beaade6a80b39a75d4fe267df6': { coingeckoId: "nota", decimals: 6 },
    '0xff7412ea7c8445c46a8254dfb557ac1e48094391': { coingeckoId: "plugin", decimals: 18 },
  },
  elrond: {
    [nullAddress]: { coingeckoId: "elrond-erd-2", decimals: 18 },
    "AERO-458bbf": { coingeckoId: "aerovek-aviation", decimals: 0 },
    "RIDE-7d18e9": { coingeckoId: "holoride", decimals: 0 },
    "ZPAY-247875": { coingeckoId: "zoid-pay", decimals: 0 },
    "UTK-2f80e9": { coingeckoId: "utrust", decimals: 0 },
    "KOSON-5dd4fa": { coingeckoId: "age-of-zalmoxis-koson", decimals: 0 },
    "ASH-a642d1": { coingeckoId: "ashswap", decimals: 0 },
    "BSK-baa025": { coingeckoId: "beskar", decimals: 0 },
    "BHAT-c1fde3": { coingeckoId: "bhnetwork", decimals: 0 },
    "CRT-52decf": { coingeckoId: "cantina-royale", decimals: 0 },
    "CTP-298075": { coingeckoId: "captain-planet", decimals: 0 },
    "CHECKR-60108b": { coingeckoId: "checkerchain", decimals: 0 },
    "CYC-b4ed61": { coingeckoId: "cyc-lock", decimals: 0 },
    "LPAD-84628f": { coingeckoId: "erdlaunchpad", decimals: 0 },
    "EVLD-43f56f": { coingeckoId: "evoload", decimals: 0 },
    "FITY-73f8fc": { coingeckoId: "fity", decimals: 0 },
    "ISET-84e55e": { coingeckoId: "isengard-nft-marketplace", decimals: 0 },
    "ITHEUM-df6f26": { coingeckoId: "itheum", decimals: 0 },
    "erd1hmfwpvsqn8ktzw3dqd0ltpcyfyasgv8mr9w0qecnmpexyp280y8q47ca9d": { coingeckoId: "jexchange", decimals: 0 },
    "KRO-df97ec": { coingeckoId: "krogan", decimals: 0 },
    "LAND-40f26f": { coingeckoId: "landboard", decimals: 0 },
    "QWT-46ac01": { coingeckoId: "qowatt", decimals: 0 },
    "SUPER-507aa6": { coingeckoId: "superciety", decimals: 0 },
    "TLC-1a2357": { coingeckoId: "tlchain", decimals: 0 },
    "UPARK-982dd6": { coingeckoId: "upark", decimals: 0 },
    "erd1qqqqqqqqqqqqqpgq3ahw8fctzfnwgvq2g4hjsqzkkvgl9ksr2jps646dnj": { coingeckoId: "vital-network", decimals: 0 },
    "WEGLD-bd4d79": { coingeckoId: "wrapped-elrond", decimals: 0 },
    "MEX-455c57": { coingeckoId: "maiar-dex", decimals: 0 },
  },
  ton: {
    [nullAddress]: { coingeckoId: "the-open-network", decimals: 9 },
    "Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF": { coingeckoId: "the-open-network", decimals: 9 },
    "EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv": { coingeckoId: "the-open-network", decimals: 9 },
    "EQAW42HutyDem98Be1f27PoXobghh81umTQ-cGgaKVmRLS7-": { coingeckoId: "ethereum", decimals: 18 },
    "EQC61IQRl0_la95t27xhIpjxZt32vl1QQVF2UgTNuvD18W-4": { coingeckoId: "usd-coin", decimals: 6 },
    "EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi": { coingeckoId: "tether", decimals: 6 },
  },
  dexit: {
    [nullAddress]: { coingeckoId: "dexit-finance", decimals: 18 },
    '0x414b8BAf9950C87804cf7E23BB43a58AE7e1E202': { coingeckoId: "dexit-finance", decimals: 18 },
  },
  empire: {
    //[nullAddress]: { coingeckoId: "", decimals: 18 },
    '0xc61a71c75ed4742dcae74b8cac27a37d46fc6751': { coingeckoId: "usd-coin", decimals: 6 },
  },
  boba_avax: {
    //[nullAddress]: { coingeckoId: "", decimals: 18 },
    '0x26c319b7b2cf823365414d082698c8ac90cbba63': { coingeckoId: "0x42bbfa2e77757c645eeaad1655e0911a7553efbc", decimals: 0 }, // boba
    '0x4200000000000000000000000000000000000023': { coingeckoId: "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", decimals: 0 }, // avax
  },
  boba_bnb: {
    //[nullAddress]: { coingeckoId: "", decimals: 18 },
    '0x4200000000000000000000000000000000000006': { coingeckoId: "0x42bbfa2e77757c645eeaad1655e0911a7553efbc", decimals: 0 }, // boba
    '0x4200000000000000000000000000000000000023': { coingeckoId: tokens.bnb, decimals: 0 }, // bnb
  },
}

ibcChains.forEach(chain => fixBalancesTokens[chain] = { ...ibcMappings, ...(fixBalancesTokens[chain] || {}) })

function getUniqueAddresses(addresses, chain) {
  const toLowerCase = !caseSensitiveChains.includes(chain)
  const set = new Set()
  addresses.forEach(i => set.add(toLowerCase ? i.toLowerCase() : i))
  return [...set]
}

function normalizeMapping(mapping, chain) {
  if (caseSensitiveChains.includes(chain)) return;
  Object.keys(mapping).forEach(
    key => (mapping[key.toLowerCase()] = mapping[key])
  );
}

for (const [chain, mapping] of Object.entries(transformTokens))
  normalizeMapping(mapping, chain)

for (const [chain, mapping] of Object.entries(fixBalancesTokens))
  normalizeMapping(mapping, chain)

for (const [chain, mapping] of Object.entries(coreAssets))
  coreAssets[chain] = mapping.map(i => stripTokenHeader(i, chain))

function getCoreAssets(chain) {
  const tokens = [
    coreAssets[chain] || [],
    Object.keys(transformTokens[chain] || {}),
    Object.keys(fixBalancesTokens[chain] || {}),
  ].flat()
  return getUniqueAddresses(tokens, chain)
}

function normalizeAddress(address, chain) {
  if (caseSensitiveChains.includes(chain)) return address
  return address.toLowerCase()
}

function stripTokenHeader(token, chain) {
  if (chain === 'aptos') return token.replace(/^aptos:/, '')
  token = normalizeAddress(token, chain);
  if (chain && !token.startsWith(chain)) return token;
  return token.indexOf(":") > -1 ? token.split(":")[1] : token;
}

const whitelistedNFTs = {
  ethereum: ["0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a", "0xed5af388653567af2f388e6224dc7c4b3241c544", "0xba30E5F9Bb24caa003E9f2f0497Ad287FDF95623", "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d", "0x306b1ea3ecdf94aB739F1910bbda052Ed4A9f949", "0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b", "0x1A92f7381B9F03921564a437210bB9396471050C", "0x1CB1A5e65610AEFF2551A50f76a87a7d3fB649C6", "0x42069ABFE407C60cf4ae4112bEDEaD391dBa1cdB", "0xb7f7f6c52f2e2fdb1963eab30438024864c313f6", "0x892848074ddeA461A15f337250Da3ce55580CA85", "0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d", "0xd1258DB6Ac08eB0e625B75b371C023dA478E94A9", "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e", "0x521f9C7505005CFA19A8E5786a9c3c9c9F5e6f42", "0xbCe3781ae7Ca1a5e050Bd9C4c77369867eBc307e", "0x026224A2940bFE258D0dbE947919B62fE321F042", "0x60e4d786628fea6478f785a6d7e704777c86a7c6", "0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7", "0x5Af0D9827E0c53E4799BB226655A1de152A425a5", "0x23581767a106ae21c074b2276d25e5c3e136a68b", "0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03", "0x34d85c9CDeB23FA97cb08333b511ac86E1C4E258", "0xbd3531da5cf5857e7cfaa92426877b022e612cf8", "0x5cc5b05a8a13e3fbdb0bb9fccd98d38e50f90c38", "0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb", "0xe785e82358879f061bc3dcac6f0444462d4b5330",],
}
function getWhitelistedNFTs(chain = 'ethereum') {
  return whitelistedNFTs[chain].map(i => i.toLowerCase())
}

module.exports = {
  nullAddress,
  tokens,
  tokensBare,
  unsupportedGeckoChains,
  caseSensitiveChains,
  transformTokens,
  fixBalancesTokens,
  normalizeAddress,
  getCoreAssets,
  ibcChains,
  stripTokenHeader,
  getUniqueAddresses,
  getWhitelistedNFTs,
}