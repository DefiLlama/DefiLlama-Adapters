const CORE_ASSETS = require("../helper/coreAssets.json");
const { getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const ABIS = {
  Market: {
    tokens:
      "function tokens() external view override returns (address fixedToken, address xToken, address gearingToken, address collateral, address debt)",
  },
  Vault: {
    asset: "address:asset",
  },
};

const Events = {
  CreateMarket:
    "event CreateMarket(address indexed market, address indexed collateral, address indexed debtToken)",
  CreateVault:
    "event CreateVault(address indexed vault, address indexed creator, (address,address,uint256,address,uint256,string,string,uint64) initialParams)",
};

const ADDRESSES = {
  // Term Structure
  zkTrueUpContractAddress: "0x09E01425780094a9754B2bd8A3298f73ce837CF9",
  // TermMax
  arbitrum: {
    Factory: {
      address: "0x14920eb11b71873d01c93b589b40585dacfca096",
      fromBlock: 322193553,
    },
    VaultFactory: [
      {
        address: "0x929cbcb8150ad59db63c92a7daec07b30d38ba79",
        fromBlock: 322193571,
      },
    ],
  },
  ethereum: {
    Factory: {
      address: "0x37ba9934aaba7a49cc29d0952c6a91d7c7043dbc",
      fromBlock: 22174761,
    },
    VaultFactory: [
      {
        address: "0x01d8c1e0584751085a876892151bf8490e862e3e",
        fromBlock: 22174789,
      },
      {
        address: "0x4778cbf91d8369843281c8f5a2d7b56d1420dff5",
        fromBlock: 22283092,
      },
    ],
  },
};

async function getTermMaxMarketAddresses(api) {
  const logs = await getLogs2({
    api,
    eventAbi: Events.CreateMarket,
    fromBlock: ADDRESSES[api.chain].Factory.fromBlock,
    target: ADDRESSES[api.chain].Factory.address,
  });
  return logs.map(([market]) => market);
}

async function getTermMaxMarketOwnerTokens(api) {
  const marketAddresses = await getTermMaxMarketAddresses(api);
  const tokens = await api.multiCall({
    abi: ABIS.Market.tokens,
    calls: marketAddresses,
  });
  const ownerTokens = [];
  for (let i = 0; i < marketAddresses.length; i += 1) {
    const marketAddress = marketAddresses[i];
    const { collateral, debt, gearingToken } = tokens[i];
    ownerTokens.push([[collateral], gearingToken]); // TVL factor: collateral on the gearing token
    ownerTokens.push([[debt], marketAddress]); // TVL factor: underlying on the market
  }
  return ownerTokens;
}

async function getTermMaxVaultAddresses(api) {
  const addresses = [];
  const promises = [];
  for (const vaultFactory of ADDRESSES[api.chain].VaultFactory) {
    const promise = async () => {
      const logs = await getLogs2({
        api,
        eventAbi: Events.CreateVault,
        fromBlock: vaultFactory.fromBlock,
        target: vaultFactory.address,
      });
      for (const log of logs) {
        const [vault] = log;
        addresses.push(vault);
      }
    };
    promises.push(promise());
  }
  await Promise.all(promises);
  return addresses;
}

async function getTermMaxVaultOwnerTokens(api) {
  const vaultAddresses = await getTermMaxVaultAddresses(api);
  const assets = await api.multiCall({
    abi: ABIS.Vault.asset,
    calls: vaultAddresses,
  });
  return assets.map(([asset], idx) => [[asset], vaultAddresses[idx]]); // TVL factor: idle fund in the vault
}

async function getTermMaxOwnerTokens(api) {
  const [marketOwnerTokens, vaultOwnerTokens] = await Promise.all([
    getTermMaxMarketOwnerTokens(api),
    getTermMaxVaultOwnerTokens(api),
  ]);
  const ownerTokens = [].concat(marketOwnerTokens).concat(vaultOwnerTokens);
  return ownerTokens;
}

async function getTermStructureOwnerTokens(api) {
  const infoAbi =
    "function getAssetConfig(uint16 tokenId) external view returns (bool isStableCoin, bool isTsbToken, uint8 decimals, uint128 minDepositAmt, address token)";
  const tokenInfo = await api.fetchList({
    lengthAbi: "getTokenNum",
    itemAbi: infoAbi,
    target: ADDRESSES.zkTrueUpContractAddress,
    startFrom: 1,
  });
  const tokens = tokenInfo.map((i) => i.token);
  tokens.push(CORE_ASSETS.ethereum.WETH);
  return tokens.map((token) => [[token], ADDRESSES.zkTrueUpContractAddress]);
}

module.exports = {
  hallmarks: [
    [
      Math.floor(new Date("2025-04-15") / 1000),
      "Sunset Term Structure and launch TermMax",
    ],
  ],
  arbitrum: {
    tvl: async (api) => {
      const ownerTokens = await getTermMaxOwnerTokens(api);
      return sumTokens2({ api, ownerTokens });
    },
  },
  ethereum: {
    tvl: async (api) => {
      const [termStructureOwnerTokens, termMaxOwnerTokens] = await Promise.all([
        getTermStructureOwnerTokens(api),
        getTermMaxOwnerTokens(api),
      ]);
      const ownerTokens = []
        .concat(termStructureOwnerTokens)
        .concat(termMaxOwnerTokens);
      return sumTokens2({ api, ownerTokens });
    },
  },
};
