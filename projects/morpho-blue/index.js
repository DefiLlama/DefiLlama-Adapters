const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require("../helper/cache/getLogs");
const abi = require("../helper/abis/morpho.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: {
    morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    blackList: [
      "0x8413D2a624A9fA8b6D3eC7b22CF7F62E55D6Bc83",
      ADDRESSES.base.USDC,
      ADDRESSES.optimism.WSTETH,
      '0x84b78bc998e4b1a63f2cf9ebfe76c55fc96a5a9b'
    ],
    fromBlock: 18883124,
    blacklistedMarketIds: [
      "0x1dca6989b0d2b0a546530b3a739e91402eee2e1536a2d3ded4f5ce589a9cd1c2",
    ],
  },
  base: {
    morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    blackList: ["0x6ee1955afb64146b126162b4ff018db1eb8f08c3", '0xda1c2c3c8fad503662e41e324fc644dc2c5e0ccd', '0x46415998764c29ab2a25cbea6254146d50d22687', '0x5e331e9ae6e1a5d375f699811736527222a9db15', '0x2dc205f24bcb6b311e5cdf0745b0741648aebd3d', '0xadcdd085ad2887758255090589f72237bdd33d8a', '0xcb327b99ff831bf8223cced12b1338ff3aa322fa', '0xadcdd085ad2887758255090589f72237bdd33d8e'],
    fromBlock: 13977148,
  },
  arbitrum: {
    morphoBlue: "0x6c247b1F6182318877311737BaC0844bAa518F5e",
    blackList: ["0xf8b3fa720a9cd8abeed5a81f11f80cd8f93e6b57"],
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
}

const eventAbis = {
  createMarket: 'event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams)'
}

const nullAddress = ADDRESSES.null

const getMarket = async (api) => {
  const { morphoBlue, fromBlock, blacklistedMarketIds = [], onlyUseExistingCache, } = config[api.chain]
  const useIndexer = api.chain === 'monad' ? true: false
  const extraKey = 'reset-v2'
  const logs = await getLogs({ api, target: morphoBlue, eventAbi: eventAbis.createMarket, fromBlock, onlyArgs: true, extraKey, onlyUseExistingCache, useIndexer })
  return logs.map((i) => i.id.toLowerCase()).filter((id) => !blacklistedMarketIds.includes(id))
}

const tvl = async (api) => {
  const { morphoBlue, blackList = [] } = config[api.chain]
  const markets = await getMarket(api)
  const marketInfos = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.idToMarketParams })
  const collCalls = [...new Set(marketInfos.map(m => m.collateralToken.toLowerCase()).filter(addr => addr !== nullAddress))];
  const withdrawQueueLengths = await api.multiCall({ calls: collCalls, abi: abi.metaMorphoFunctions.withdrawQueueLength, permitFailure: true })
  const filterMarkets = marketInfos.filter((_, i) => withdrawQueueLengths[i] == null || withdrawQueueLengths[i] > 30 || withdrawQueueLengths[i] < 0);
  const tokens = filterMarkets.flatMap(({ collateralToken, loanToken }) => [collateralToken, loanToken])
  return sumTokens2({ api, owner: morphoBlue, tokens, blacklistedTokens: blackList, permitFailure: true })
}

const borrowed = async (api) => {
  const { morphoBlue } = config[api.chain]
  const markets = await getMarket(api)
  const marketInfos = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.idToMarketParams })
  const marketDatas = await api.multiCall({ target: morphoBlue, calls: markets, abi: abi.morphoBlueFunctions.market })

  marketDatas.forEach((data, idx) => {
    const { collateralToken, loanToken } = marketInfos[idx];
    if (collateralToken.toLowerCase() !== '0xda1c2c3c8fad503662e41e324fc644dc2c5e0ccd') {
      api.add(loanToken, data.totalBorrowAssets);
    }
  });
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl, borrowed }
})
