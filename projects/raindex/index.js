const { sumTokens2 } = require("../helper/unwrapLPs")
const ADDRESSES = require("../helper/coreAssets.json")

const config = {
  arbitrum: {
    owners: [
      "0x90caf23ea7e507bb722647b0674e50d8d6468234",
      "0x550878091b2b1506069f61ae59e3a5484bca9166",
      "0x8df8075e4077dabf1e95f49059e4c1eea33094ab",
    ],
    tokens: [
      ADDRESSES.arbitrum.ARB,
      ADDRESSES.arbitrum.USDT,
      ADDRESSES.arbitrum.WBTC,
      ADDRESSES.arbitrum.WETH,
      ADDRESSES.arbitrum.USDC_CIRCLE,
      "0x16a500aec6c37f84447ef04e66c57cfc6254cf92", // ZRO
      "0x306fd3e7b169aa4ee19412323e1a5995b8c1a1f4", // FTW
      "0x88a269df8fe7f53e590c561954c52fccc8ec0cfb", // NST
      "0x11cdb42b0eb46d95f990bedd4695a6e3fa034978", // PENDLE
      "0x6985884c4392d348587b19cb9eaaf157f13271cd", // USDT0
      "0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8", // CRV
      "0xdadeca1167fe47499e53eb50f261103630974905", // NRN
    ],
  },
  base: {
    owners: [
      "0x2aee87d75cd000583daec7a28db103b1c0c18b76",
      "0xd2938e7c9fe3597f78832ce780feb61945c377d7",
      "0xa2f56f8f74b7d04d61f281be6576b6155581dcba",
      "0x32aCbdF51abe567C91b7a5cd5E52024a5Ca56844",
      "0x80DE00e3cA96AE0569426A1bb1Ae22CD4181dE6F",
      "0x7A44459893F99b9d9a92d488eb5d16E4090f0545",
      "0x881cf4c0764e733d9c387f3858ee87cca04affe0",
      "0x52ceb8ebef648744ffdde89f7bc9c3ac35944775",
      "0xe522cB4a5fCb2eb31a52Ff41a4653d85A4fd7C9D",
    ],
    tokens: [
      ADDRESSES.base.USDC,
      ADDRESSES.base.WETH,
      "0x99b2b1a2adb02b38222adcd057783d7e5d1fcc7d", // WLTH
      "0xfb18511f1590a494360069f3640c27d55c2b5290", // WGC
      "0x653a143b8d15c565c6623d1f168cfbec1056d872", // kurbi
      "0x623cd3a3edf080057892aaf8d773bbb7a5c9b6e9", // SKYA
      "0x655a51e6803faf50d4ace80fa501af2f29c856cf", // PAID
      "0x2c002ffec41568d138acc36f5894d6156398d539", // LUCKY
      "0x2f20cf3466f80a5f7f532fca553c8cbc9727fef6", // AKUMA
      "0x4d58608eff50b691a3b76189af2a7a123df1e9ba", // BOYS
      "0x4b6104755afb5da4581b81c552da3a25608c73b8", // SKITTEN
      "0xca72827a3d211cfd8f6b00ac98824872b72cab49", // cgUSD
      "0x1111111111166b7fe7bd91427724b487980afc69", // ZORA
      "0x2c001233ed5e731b98b15b30267f78c7560b71f2", // BUBU
      "0x07d15798a67253d76cea61f0ea6f57aedc59dffb", // BASED
      "0x26c69e4924bd0d7d52d680b33616042ee13f621c", // SALUKI
      "0x02dd23668605ddc983bc2a2afa99f47d88a2f98b", // BRO
      "0x09b052085e9c6291fbf0dfb0918c861bcb47eb25", // RICKY
      "0x8890de1637912fbbba36b8b19365cdc99122bd6e", // SLAP
      "0x3d63825b0d8669307366e6c8202f656b9e91d368", // WGC
      "0xd262a4c7108c8139b2b189758e8d17c3dfc91a38", // CYPR
      "0x0c03ce270b4826ec62e7dd007f0b716068639f7b", // TIG
      "0x00000e7efa313f4e11bfff432471ed9423ac6b30", // HYDX
    ],
  },
  bsc: {
    owners: [
      "0xb1d6d10561d4e1792a7c6b336b0529e4bfb5ea8f",
      "0xd2938e7c9fe3597f78832ce780feb61945c377d7",
    ],
    tokens: [
      ADDRESSES.bsc.BTCB,
      ADDRESSES.bsc.BUSD,
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.WBNB,
      "0x8f0fb159380176d324542b3a7933f0c2fd0c2bbf", // TFT
      "0xad86d0e9764ba90ddd68747d64bffbd79879a238", // PAID
      "0x194b302a4b0a79795fb68e2adf1b8c9ec5ff8d1f", // wkeyDAO
      "0x963556de0eb8138e97a85f0a86ee0acd159d210b", // MARCO
    ],
  },
  ethereum: {
    owners: [
      "0xf1224a483ad7f1e9aa46a8ce41229f32d7549a74",
      "0x0eA6d458488d1cf51695e1D6e4744e6FB715d37C",
    ],
    tokens: [
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.USDC,
      "0x13e4b8cffe704d3de6f19e52b201d92c21ec18bd", // WMTX
      "0xdbb5cf12408a3ac17d668037ce289f9ea75439d7", // PAI
    ],
  },
  flare: {
    owners: [
      "0xb06202aA3Fe7d85171fB7aA5f17011d17E63f382",
      "0xcee8cd002f151a536394e564b84076c41bbbcd4d",
      "0xaa3b14Af0e29E3854E4148f43321C4410db002bC",
      "0xA2Ac77b982A9c0999472c1De378A81d7363d926F",
      "0x582d9e838FE6cD9F8147C66A8f56A3FBE513a6A2",
    ],
    tokens: [
      ADDRESSES.flare.WFLR,
      "0x96b41289d90444b8add57e6f265db5ae8651df29", // USDC.e
      "0x22757fb83836e3f9f0f353126cacd3b1dc82a387", // cyWETH
      "0xc6b19b06a92b337cbca5f7334d29d45ec4d5e532", // USDT
      "0xfbda5f676cb37624f28265a144a48b0d6e87d3b6", // cysFLR
      "0x19831cfb53a0dbead9866c43557c1d48dff76567", // sFLR
      "0x12e605bc104e93b45e1ad99f9e555f659051c2bb", // WETH
      "0x0b38e83b86d491735feaa0a791f65c2b99535396", // flrETH
      "0xe7cd86e13ac4309349f30b3435a9d337750fc82d", // eUSDT
      "0x26a1fab310bd080542dc864647d05985360b16a5", // USDT0
      "0x1502fa4be69d526124d453619276faccab275d3d", // WETH
      "0xd8bf1d2720e9ffd01a2f9a2efc3e101a05b852b4", // cyWETH
    ],
  },
  linea: {
    owners: [
      "0x22410e2a46261a1b1e3899a072f303022801c764",
      "0xF97DE1c2d864d90851aDBcbEe0A38260440B8D90",
    ],
    tokens: [
      ADDRESSES.linea.WETH,
      ADDRESSES.linea.USDT,
      "0x4ea77a86d6e70ffe8bb947fc86d68a7f086f198a", // CLIP
    ],
  },
  polygon: {
    owners: [
      "0xde5abe2837bc042397d80e37fb7b2c850a8d5a6c",
      "0x34200e026fbac0c902a0ff18e77a49265ca6ac99",
      "0xd3edafeb9eaa454ce26e60a66ccda73939c343a4",
      "0xc95a5f8efe14d7a20bd2e5bafec4e71f8ce0b9a6",
      "0x95c9bf235435b660aa69f519904c3f175aab393d",
      "0xdcdee0e7a58bba7e305db3abc42f4887ce8ef729",
      "0x16d518706d666c549da7bd31110623b09ef23abb",
      "0x7d2f700b1f6fd75734824ea4578960747bdf269a",
      "0x2f209e5b67a33b8fe96e28f24628df6da301c8eb",
      "0xb8CD71e3b4339c8B718D982358cB32Ed272e4174",
      "0x001B302095D66b777C04cd4d64b86CCe16de55A1",
      "0xAfD94467d2eC43D9aD39f835BA758b61b2f41A0E",
      "0x8a3c8e610d827093f7437e0c45efa648563c0dda",
    ],
    tokens: [
      ADDRESSES.polygon.DAI,
      ADDRESSES.polygon.USDT,
      ADDRESSES.polygon.WMATIC_2,
      ADDRESSES.polygon.USDC,
      ADDRESSES.polygon.USDC_CIRCLE,
      ADDRESSES.polygon.QUICK,
      "0x692ac1e363ae34b6b489148152b12e2785a3d8d6", // IOEN
      "0x658cda444ac43b0a7da13d638700931319b64014", // SMT
      "0x84342e932797fc62814189f01f0fb05f52519708", // NHT
      "0xf8dda7b3748254d562f476119b0ae6044bad10a5", // USDT0
      "0x8226ac9edb26ff16da19151042a8ba3bb2cc237f", // ELG
      "0xd0e9c8f5fae381459cf07ec506c1d2896e8b5df6", // MNW
      "0x3c59798620e5fec0ae6df1a19c6454094572ab92", // TRADE
      "0xe8d17b127ba8b9899a160d9a07b69bca8e08bfc6", // NSDX
      "0x6fb54ffe60386ac33b722be13d2549dd87bf63af", // POLI
      "0xe1b3eb06806601828976e491914e3de18b5d6b28", // ZERC
    ],
  },
}

async function tvl(api) {
  const { owners, tokens } = config[api.chain]
  return sumTokens2({ api, owners, tokens, permitFailure: true })
}

module.exports = {
  methodology: 'Balance of tokens held by Rain Orderbook contract.',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
