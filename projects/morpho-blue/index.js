const { getLogs } = require("../helper/cache/getLogs");
const abi = require("../helper/abis/morpho.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  methodology: `Collateral (supply minus borrows) in the balance of the Morpho contracts`,
};

const config = {
  ethereum: {
    morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    blackList: [
      "0x8413D2a624A9fA8b6D3eC7b22CF7F62E55D6Bc83",
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    ],
    fromBlock: 18883124,
    blacklistedMarketIds: [
      "0x1dca6989b0d2b0a546530b3a739e91402eee2e1536a2d3ded4f5ce589a9cd1c2",
    ],
  },
  base: {
    morphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    blackList: ["0x6ee1955afb64146b126162b4ff018db1eb8f08c3", '0xda1c2c3c8fad503662e41e324fc644dc2c5e0ccd'],
    fromBlock: 13977148,
  },
  arbitrum: {
    morphoBlue: "0x6c247b1F6182318877311737BaC0844bAa518F5e",
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
  flame:{
    morphoBlue: "0x63971484590b054b6Abc4FEe9F31BC6F68CfeC04",
    fromBlock: 5991116,
  },
  /*
  tacchain_2390_1:{
    morphoBlue: "0xF0453e7368Ea01d6d6d6a222C26B5a06F1d816e9",
    fromBlock: 3669141,
  },
  */
  basecamp:{
    morphoBlue: "0xc7CAd9B1377Eb8103397Cb07Cb5c4f03eb2eBEa8",
    fromBlock: 4804080,
    blackList: ['0x68d6024e5168f16d3453a23b36f393a559be7aef'],
  },
  hyperliquid:{
    morphoBlue: "0x68e37dE8d93d3496ae143F2E900490f6280C57cD",
    fromBlock: 1988429,
  },
  plume_mainnet: {
    morphoBlue: "0x42b18785CE0Aed7BF7Ca43a39471ED4C0A3e0bB5",
    fromBlock: 765994,
  },
};

Object.keys(config).forEach((chain) => {
  const {
    morphoBlue,
    fromBlock,
    blackList = [],
    blacklistedMarketIds = [],
  } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      let marketIds = await getMarkets(api);
      if (blacklistedMarketIds.length > 0) {
        const lowerCaseBlacklist = blacklistedMarketIds.map(id => id.toLowerCase());
        marketIds = marketIds.filter(id => !lowerCaseBlacklist.includes(id.toLowerCase()));
      }
      const tokens = (
        await api.multiCall({
          target: morphoBlue,
          calls: marketIds,
          abi: abi.morphoBlueFunctions.idToMarketParams,
        })
      )
        .map((i) => [i.collateralToken, i.loanToken])
        .flat();

      return sumTokens2({
        api,
        owner: morphoBlue,
        tokens,
        blacklistedTokens: blackList,
      });
    },
    borrowed: async (api) => {
      let marketIds = await getMarkets(api);
      if (blacklistedMarketIds.length > 0) {
        const lowerCaseBlacklist = blacklistedMarketIds.map(id => id.toLowerCase());
        marketIds = marketIds.filter(id => !lowerCaseBlacklist.includes(id.toLowerCase()));
      }
      const marketInfo = await api.multiCall({
        target: morphoBlue,
        calls: marketIds,
        abi: abi.morphoBlueFunctions.idToMarketParams,
      });
      const marketData = await api.multiCall({
        target: morphoBlue,
        calls: marketIds,
        abi: abi.morphoBlueFunctions.market,
      });
      marketData.forEach((i, idx) => {
        if (marketInfo[idx].collateralToken.toLowerCase() === '0xda1c2c3c8fad503662e41e324fc644dc2c5e0ccd'.toLowerCase()) return;
        api.add(marketInfo[idx].loanToken, i.totalBorrowAssets);
      });
      return api.getBalances();
    },
  };

  async function getMarkets(api) {
    const logs = await getLogs({
      api,
      target: morphoBlue,
      eventAbi:
        "event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv) marketParams)",
      onlyArgs: true,
      fromBlock,
      topics: [
        "0xac4b2400f169220b0c0afdde7a0b32e775ba727ea1cb30b35f935cdaab8683ac",
      ],
    });
    return logs.map((i) => i.id);
  }
})
