const CORE_ASSETS = require("../helper/coreAssets.json");
const { getLogs2 } = require("../helper/cache/getLogs");
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

const Events = {
  CreateMarket: {
    eventAbi:
      "event CreateMarket(address indexed market, address indexed collateral, address indexed debtToken)",
    topic: "0x3f53d2c2743b2b162c0aa5d678be4058d3ae2043700424be52c04105df3e2411",
  },
  CreateVault: {
    eventAbi:
      "event CreateVault(address indexed vault, address indexed creator, tuple(address,address,uint256,address,uint256,string,string,uint64) indexed initialParams)",
    topic: "0x8d49b14f2b628cc0c1a7ad5e098155260cd1881003c9d3107c728be96f706b33",
  },
};

const ADDRESSES = {
  // Term Structure
  zkTrueUpContractAddress: "0x09E01425780094a9754B2bd8A3298f73ce837CF9",
  // TermMax
  arbitrum: {
    Factory: {
      address: "0x14920Eb11b71873d01c93B589b40585dacfCA096",
      fromBlock: 322193553,
    },
    VaultFactory: [
      {
        address: "0x929CBcb8150aD59DB63c92A7dAEc07b30d38bA79",
        fromBlock: 322193571,
      },
    ],
    Vaults: [
      // TermMax WETH Vault
      [
        [CORE_ASSETS.arbitrum.WETH],
        "0x8c5161f287Cbc9Afa48bC8972eE8CC0a755fcAdC",
      ],
      // TermMax USDC Vault
      [
        [CORE_ASSETS.arbitrum.USDC],
        "0xc94b752839a22d2c44e99e298671dd4b2add11b3",
      ],
    ],
  },
  bsc: {
    Factory: {
      address: "0x8Df05E11e72378c1710e296450Bf6b72e2F12019",
      fromBlock: 50519690,
    },
    VaultFactory: [
      {
        address: "0x48bCd27e208dC973C3F56812F762077A90E88Cea",
        fromBlock: 50519690,
      },
    ],
    Vaults: [
      // TermMax USDT Vault
      [[CORE_ASSETS.bsc.USDT], "0x86c958CAc8aeE37dE62715691c0D597c710Eca51"],
      // TermMax WBNB Vault
      [[CORE_ASSETS.bsc.WBNB], "0x89653E6523fB73284353252b41AE580E6f96dFad"],
    ],
  },
  ethereum: {
    Factory: {
      address: "0x37Ba9934aAbA7a49cC29d0952C6a91d7c7043dbc",
      fromBlock: 22174761,
    },
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
    Vaults: [
      // TermMax wstETH Vault
      [
        [CORE_ASSETS.ethereum.WSTETH],
        "0xDAdeAcC03a59639C0ecE5ec4fF3BC0d9920A47eC",
      ],
      // TermMax USDC Vault
      [
        [CORE_ASSETS.ethereum.USDC],
        "0x984408C88a9B042BF3e2ddf921Cd1fAFB4b735D1",
      ],
      // TermMax USDC Prime
      [
        [CORE_ASSETS.ethereum.USDC],
        "0x13e361dC94459a01bc4991F9e681033Dc2b0fA5A",
      ],
      // TermMax WETH Vault
      [
        [CORE_ASSETS.ethereum.WETH],
        "0xDEB8a9C0546A01b7e5CeE8e44Fd0C8D8B96a1f6e",
      ],
      // TermMax pufETH Vault
      [
        ["0xD9A442856C234a39a81a089C06451EBAa4306a72"], // pufETH
        "0xdC4d99aB6c69943b4E17431357AbC5b54B4C2F56",
      ],
      // TermMax XAU Vault
      [
        [CORE_ASSETS.ethereum.USDC],
        "0x240Dd52089899a71454942b6Ba3ef4dbcBAd57fd",
      ],
    ],
  },
};

async function getTermMaxMarketAddresses(api) {
  const logs = await getLogs2({
    api,
    eventAbi: Events.CreateMarket.eventAbi,
    topic: Events.CreateMarket.topic,
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
        eventAbi: Events.CreateVault.eventAbi,
        topic: Events.CreateVault.topic,
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
  // TVL factor: idle fund in the vault
  return (
    assets
      .map(([asset], idx) => [[asset], vaultAddresses[idx]])
      // Hard-code vault addresses here since
      // CreateVault events are not returned by RPC used by DefiLlama
      .concat(ADDRESSES[api.chain].Vaults)
  );
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

async function getTermMaxMarketBorrowed(api) {
  const marketAddresses = await getTermMaxMarketAddresses(api);
  const [tokens, configs] = await Promise.all([
    api.multiCall({ abi: ABIS.Market.tokens, calls: marketAddresses }),
    api.multiCall({ abi: ABIS.Market.config, calls: marketAddresses }),
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
};
