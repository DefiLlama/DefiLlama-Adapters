const CORE_ASSETS = require("../helper/coreAssets.json");
const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const ABIS = {
  Market: {
    config:
      "function config() external view returns (address treasurer, uint64 maturity, tuple(uint32,uint32,uint32,uint32,uint32,uint32) feeConfig)",
    tokens:
      "function tokens() external view override returns (address fixedToken, address xToken, address gearingToken, address collateral, address debt)",
  },
  MintableERC20: {
    totalSupply: "function totalSupply() external view returns (uint256)",
  },
  Vault: {
    asset: "address:asset",
  },
};

const EVENTS = {
  V1: {
    CreateMarket:
      "event CreateMarket(address indexed market, address indexed collateral, address indexed debtToken)",
    CreateVault:
      "event CreateVault(address indexed vault, address indexed creator, (address admin,address curator,uint256 timelock,address asset,uint256 maxCapacity,string name,string symbol,uint64 performanceFeeRate) indexed initialParams)",
  },
  V1Plus: {
    VaultCreated:
      "event VaultCreated(address indexed vault, address indexed creator, tuple(address admin,address curator,address guardian,uint256 timelock,address asset,uint256 maxCapacity,string name,string symbol,uint64 performanceFeeRate,uint64 minApy,uint64 minIdleFundRate) initialParams)",
  },
  V2: {
    MarketCreated:
      "event MarketCreated(address indexed market, address indexed collateral, address indexed debtToken, tuple(address collateral,address debtToken,address admin,address gtImplementation,tuple(address treasurer,uint64 maturity,tuple(uint32 lendTakerFeeRatio,uint32 lendMakerFeeRatio,uint32 borrowTakerFeeRatio,uint32 borrowMakerFeeRatio,uint32 mintGtFeeRatio,uint32 mintGtFeeRef) feeConfig) marketConfig,(address oracle,uint32 liquidationLtv,uint32 maxLtv,bool liquidatable) loanConfig,bytes gtInitalParams,string tokenName,string tokenSymbol) params)",
    VaultCreated:
      "event VaultCreated(address indexed vault, address indexed creator, (address admin,address curator,address guardian,uint256 timelock,address asset,address pool,uint256 maxCapacity,string name,string symbol,uint64 performanceFeeRate,uint64 minApy) initialParams)",
  },
};

const ADDRESSES = {
  // Term Structure
  zkTrueUpContractAddress: "0x09E01425780094a9754B2bd8A3298f73ce837CF9",
  // TermMax
  arbitrum: {
    Factory: {
      address: "0x14920Eb11b71873d01c93B589b40585dacfCA096",
      fromBlock: 322190000,
    },
    VaultFactory: [
      {
        address: "0x929CBcb8150aD59DB63c92A7dAEc07b30d38bA79",
        fromBlock: 322193571,
      },
    ],
    VaultFactoryV2: [
      {
        address: "0xa7c93162962D050098f4BB44E88661517484C5EB",
        fromBlock: 385228046,
      },
      {
        address: "0x18b8A9433dBefcd15370F10a75e28149bcc2e301",
        fromBlock: 385228046,
      },
    ],
  },
  bsc: {
    Factory: {
      address: "0x8Df05E11e72378c1710e296450Bf6b72e2F12019",
      fromBlock: 50519690,
    },
    FactroryV2: [
      // Start of TermMax Alpha
      {
        address: "0x96839e9B0482BfFA7e129Ce9FEEFCeb1e895fC2B",
        fromBlock: 67248948,
      },
      // End of TermMax Alpha
    ],
    VaultFactory: [
      {
        address: "0x48bCd27e208dC973C3F56812F762077A90E88Cea",
        fromBlock: 50519589,
      },
    ],
    VaultFactoryV2: [
      {
        address: "0x1401049368eD6AD8194f8bb7E41732c4620F170b",
        fromBlock: 63100000,
      },
      {
        address: "0xdffE6De6de1dB8e1B5Ce77D3222eba401C2573b5",
        fromBlock: 63100000,
      },
      // Start of TermMax Alpha
      {
        address: "0xC63858D1eFa377f94392Ba5dEb521233Ec1548eb",
        fromBlock: 67251242,
      },
      // End of TermMax Alpha
    ],
  },
  ethereum: {
    Factory: {
      address: "0x37Ba9934aAbA7a49cC29d0952C6a91d7c7043dbc",
      fromBlock: 22174000,
    },
    FactoryV2: [
      {
        address: "0x1c86801e8ad0726298383e30c2c1a844887a61bd",
        fromBlock: 23430000,
      },
      {
        address: "0xc53ab74eeb5e818147eb6d06134d81d3ac810987",
        fromBlock: 23488600,
      },
    ],
    VaultFactory: [
      {
        address: "0x01D8C1e0584751085a876892151Bf8490e862E3E",
        fromBlock: 22174789,
      },
      {
        address: "0x4778CBf91d8369843281c8f5a2D7b56d1420dFF5",
        fromBlock: 22283092,
      },
    ],
    VaultFactoryV1Plus: [
      {
        address: "0x3a9ECfFDBDc595907f65640F810d3dDDDDe2FA61",
        fromBlock: 23138659,
      },
    ],
    VaultFactoryV2: [
      {
        address: "0xF2BDa87CA467eB90A1b68f824cB136baA68a8177",
        fromBlock: 23430000,
      },
      {
        address: "0x5b8B26a6734B5eABDBe6C5A19580Ab2D0424f027",
        fromBlock: 23430000,
      },
    ],
  },
  berachain: {
    FactoryV2: [
      {
        address: "0x4BC4F8f9B212B5a3F9f7Eeb35Ae1A91902670F7f",
        fromBlock: 11541952,
      },
    ],
    VaultFactoryV2: [
      {
        address: "0x65fC69DE62E11592E8Acf57a0c97535209090Ef1",
        fromBlock: 11541953,
      },
    ],
  },
  hyperliquid: {
    FactoryV2: [
      {
        address: "0xC1Ce945e55506B384daDDEf48FA5A78554560ad3",
        fromBlock: 15997179,
      },
    ],
    VaultFactoryV2: [
      {
        address: "0xA0E0702b701cCaC329732Bb409681612f43E41AD",
        fromBlock: 15997362,
      },
    ],
  },
};

const VAULT_BLACKLIST = {
  arbitrum: [
    "0x8531dC1606818A3bc3D26207a63641ac2F1f6Dc8", // misconfigured asset
  ],
  ethereum: [],
  bsc: [
    "0xe5E01B82904a49Ce5a670c1B7488C3f29433088a", // misconfigured asset
  ],
};

async function getTermMaxMarketAddresses(api) {
  if (!ADDRESSES[api.chain].Factory) return [];
  const logs = await getLogs({
    api,
    eventAbi: EVENTS.V1.CreateMarket,
    fromBlock: ADDRESSES[api.chain].Factory.fromBlock,
    target: ADDRESSES[api.chain].Factory.address,
    onlyArgs: true,
    extraKey: `termmax-market-v1-${api.chain}`,
  });
  return logs.map(([market]) => market);
}

async function getTermMaxMarketV2Addresses(api) {
  if (!ADDRESSES[api.chain].FactoryV2) return [];
  const addresses = [];
  const tasks = [];
  for (const factory of ADDRESSES[api.chain].FactoryV2) {
    const task = async () => {
      const logs = await getLogs({
        api,
        eventAbi: EVENTS.V2.MarketCreated,
        fromBlock: factory.fromBlock,
        target: factory.address,
        onlyArgs: true,
        extraKey: `termmax-market-v2-${api.chain}`,
      });
      for (const [market] of logs) addresses.push(market);
    };
    tasks.push(task());
  }
  await Promise.all(tasks);
  return addresses;
}

async function getTermMaxMarketOwnerTokens(api) {
  const [marketV1Addresses, marketV2Addresses] = await Promise.all([
    getTermMaxMarketAddresses(api),
    getTermMaxMarketV2Addresses(api),
  ]);
  const marketAddresses = []
    .concat(marketV1Addresses)
    .concat(marketV2Addresses);
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
  if (!ADDRESSES[api.chain].VaultFactory) return [];
  const addresses = [];
  const promises = [];
  for (const vaultFactory of ADDRESSES[api.chain].VaultFactory) {
    const promise = async () => {
      const logs = await getLogs({
        api,
        eventAbi: EVENTS.V1.CreateVault,
        fromBlock: vaultFactory.fromBlock,
        target: vaultFactory.address,
        onlyArgs: true,
        extraKey: `termmax-vault-v1-${api.chain}`,
      });
      for (const [vault] of logs) addresses.push(vault);
    };
    promises.push(promise());
  }
  await Promise.all(promises);
  return addresses;
}

async function getTermMaxVaultV1PlusAddresses(api) {
  if (!ADDRESSES[api.chain].VaultFactoryV1Plus) return [];
  const addresses = [];
  const promises = [];
  for (const vaultFactory of ADDRESSES[api.chain].VaultFactoryV1Plus) {
    const promise = async () => {
      const logs = await getLogs({
        api,
        eventAbi: EVENTS.V1Plus.VaultCreated,
        fromBlock: vaultFactory.fromBlock,
        target: vaultFactory.address,
        onlyArgs: true,
        extraKey: `termmax-vault-v1-plus-${api.chain}`,
      });
      for (const [vault] of logs) addresses.push(vault);
    };
    promises.push(promise());
  }
  await Promise.all(promises);
  return addresses;
}

async function getTermMaxVaultV2Addresses(api) {
  if (!ADDRESSES[api.chain].VaultFactoryV2) return [];
  const addresses = [];
  const promises = [];
  for (const vaultFactory of ADDRESSES[api.chain].VaultFactoryV2) {
    const promise = async () => {
      const logs = await getLogs({
        api,
        eventAbi: EVENTS.V2.VaultCreated,
        fromBlock: vaultFactory.fromBlock,
        target: vaultFactory.address,
        onlyArgs: true,
        extraKey: `termmax-vault-v2-${api.chain}`,
      });
      for (const [vault] of logs) addresses.push(vault);
    };
    promises.push(promise());
  }
  await Promise.all(promises);
  return addresses;
}

async function getTermMaxVaultOwnerTokens(api) {
  const [vaultV1Addresses, vaultV1PlusAddresses, vaultV2Addresses] =
    await Promise.all([
      getTermMaxVaultAddresses(api),
      getTermMaxVaultV1PlusAddresses(api),
    ]);
  const vaultAddresses = []
    .concat(vaultV1Addresses)
    .concat(vaultV1PlusAddresses)
    .filter((address) => !VAULT_BLACKLIST[api.chain]?.includes(address));
  const assets = await api.multiCall({
    abi: ABIS.Vault.asset,
    calls: vaultAddresses,
  });
  // TVL factor: idle fund in the vault
  return assets.map((asset, idx) => [[asset], vaultAddresses[idx]]);
}

async function recordVaultV2Assets(api) {
  const vaultV2Addresses = await getTermMaxVaultV2Addresses(api);
  const [assets, totalAssets] = await Promise.all([
    api.multiCall({
      abi: ABIS.Vault.asset,
      calls: vaultV2Addresses,
    }),
    api.multiCall({
      abi: "uint256:totalAssets",
      calls: vaultV2Addresses,
    }),
  ]);
  for (let i = 0; i < vaultV2Addresses.length; i += 1) {
    const asset = assets[i];
    const totalAsset = totalAssets[i];
    api.add(asset, totalAsset);
  }
}

async function getTermMaxOwnerTokens(api) {
  const [marketOwnerTokens, vaultOwnerTokens] = await Promise.all([
    getTermMaxMarketOwnerTokens(api),
    getTermMaxVaultOwnerTokens(api),
  ]);
  await recordVaultV2Assets(api);
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

async function getTermMaxMarketBorrowed(api) {
  const marketAddresses = await getTermMaxMarketAddresses(api);
  const [tokens, configs] = await Promise.all([
    api.multiCall({
      abi: ABIS.Market.tokens,
      calls: marketAddresses,
    }),
    api.multiCall({
      abi: ABIS.Market.config,
      calls: marketAddresses,
    }),
  ]);

  const activeMarkets = [];
  for (let i = 0; i < marketAddresses.length; i += 1) {
    const marketAddress = marketAddresses[i];
    const { maturity } = configs[i];
    if (maturity <= api.timestamp) continue;

    const { fixedToken, xToken, debt } = tokens[i];
    activeMarkets.push({ marketAddress, fixedToken, xToken, debt });
  }

  const mintableERC20Array = Array.from(
    new Set(
      activeMarkets.flatMap(({ fixedToken, xToken }) => [fixedToken, xToken])
    )
  );
  const totalSupplies = await api.multiCall({
    abi: ABIS.MintableERC20.totalSupply,
    calls: mintableERC20Array,
  });
  const tokenSupplyMap = new Map(
    totalSupplies.map((supply, index) => [mintableERC20Array[index], supply])
  );

  for (const activeMarket of activeMarkets) {
    const { fixedToken, xToken, debt } = activeMarket;

    const ftSupply = tokenSupplyMap.get(fixedToken);
    if (!ftSupply) continue;

    const xtSupply = tokenSupplyMap.get(xToken);
    if (!xtSupply) continue;

    api.add(debt, ftSupply - xtSupply);
  }
}

module.exports = {
  hallmarks: [
    [
      Math.floor(new Date("2025-04-15") / 1000),
      "Sunset Term Structure and launch TermMax",
    ],
  ],
  // 1st batch deployment
  arbitrum: {
    borrowed: getTermMaxMarketBorrowed,
    tvl: async (api) => {
      const ownerTokens = await getTermMaxOwnerTokens(api);
      return sumTokens2({ api, ownerTokens });
    },
  },
  bsc: {
    borrowed: getTermMaxMarketBorrowed,
    tvl: async (api) => {
      const ownerTokens = await getTermMaxOwnerTokens(api);
      return sumTokens2({ api, ownerTokens });
    },
  },
  ethereum: {
    borrowed: getTermMaxMarketBorrowed,
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
  // 2nd batch deployment
  berachain: {
    borrowed: getTermMaxMarketBorrowed,
    tvl: async (api) => {
      const ownerTokens = await getTermMaxOwnerTokens(api);
      return sumTokens2({ api, ownerTokens });
    },
  },
  hyperliquid: {
    borrowed: getTermMaxMarketBorrowed,
    tvl: async (api) => {
      const ownerTokens = await getTermMaxOwnerTokens(api);
      return sumTokens2({ api, ownerTokens });
    },
  },
};
