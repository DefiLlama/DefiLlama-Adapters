const CORE_ASSETS = require("../helper/coreAssets.json");
const { getLogs, getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

/**
 * bsquared uBTC/WBTC markets excluded: TVL inflated by minter-funded wallets
 * and borrow-redeposit loops. All vault/GT deposits trace back to 2-3 uBTC minters:
 *   0x1c8b1b0ec2c6f0Ef56c740BFD3A95af7cf5f8DC7 (minted 214 uBTC, funded 0x46d1 and 0xb5E0)
 *   0x8Da30b68b1E11761e1307EB10564a39E01ae4480 (minted 108 uBTC, funded 0xAB34, 0x42Be, 0x3a59)
 *   0x33aa8b84062583966a33edF235694AcdC6A138eA (minted 100 uBTC)
 * Borrow-redeposit loop example (0x1c8b):
 *   borrow 20 WBTC: 0x0bfd30c486a8cad719a73ad200fcbc38decbf2f404066f652b73f175f287b967
 *   borrow 20 WBTC: 0xff07b8c6d21c947faf895ed00a78aaa8509fe2d207c4b35122d55e35567452e9
 *   redeposit 40 WBTC: 0x054cf18d0029f27c8ce57c58a947ebd31bf2d557ee46fad62d081c8330c570b2
 */

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
  Viewer: {
    getPoolUnclaimedRewards:
      "function getPoolUnclaimedRewards(address[] pools) external view returns (address[] asset, uint256[] amount)",
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
  TermMax4626Factory: {
    "StableERC4626For4626Created": "event StableERC4626For4626Created(address indexed caller, address indexed stableERC4626For4626)",
    "StableERC4626ForAaveCreated": "event StableERC4626ForAaveCreated(address indexed caller, address indexed stableERC4626ForAave)",
    "StableERC4626ForCustomizeCreated": "event StableERC4626ForCustomizeCreated(address indexed caller, address indexed stableERC4626ForCustomize)",
    "VariableERC4626ForAaveCreated": "event VariableERC4626ForAaveCreated(address indexed caller, address indexed variableERC4626ForAave)"
  }
};

const ADDRESSES = {
  // Term Structure
  // TermMax
  arbitrum: {
    Factory: {
      address: "0x14920Eb11b71873d01c93B589b40585dacfCA096",
      fromBlock: 322190000,
    },
    FactoryV2: [
      {
        address: "0x18b8A9433dBefcd15370F10a75e28149bcc2e301",
        fromBlock: 385228046,
      },
    ],
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
    ],
    TermMax4626Factory: [
      { address: "0xe306A0A5Ac675dab1CD77aA7873D241715aEB217", fromBlock: 385274993 },
    ],
  },
  bsc: {
    Factory: {
      address: "0x8Df05E11e72378c1710e296450Bf6b72e2F12019",
      fromBlock: 50519690,
    },
    FactoryV2: [
      {
        address: "0xdffE6De6de1dB8e1B5Ce77D3222eba401C2573b5",
        fromBlock: 63100000,
      },
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
      // Start of TermMax Alpha
      {
        address: "0xC63858D1eFa377f94392Ba5dEb521233Ec1548eb",
        fromBlock: 67251242,
      },
      // End of TermMax Alpha
    ],
    TermMax4626Factory: [
      { address: "0x67dcDCc57208B574B05999AA3dFA57bfF2324129", fromBlock: 63208984 },
      { address: "0xbe6f455123f6cdea1352d4510cCDe3D71D139ae7", fromBlock: 80402323 },
    ],
    // MarketV2Factory: [  // it is termMax market v2? https://github.com/DefiLlama/DefiLlama-Adapters/pull/17483 anyway, atm there is only testing with brBTC, excluding it for now
    //   {
    //     address: "0x529A60A7aCDBDdf3D71d8cAe72720716BC192106",
    //     fromBlock: 71136348,
    //   },
    // ],
  },
  ethereum: {
    zkTrueUpContractAddress: "0x09E01425780094a9754B2bd8A3298f73ce837CF9",
    Factory: {
      address: "0x37Ba9934aAbA7a49cC29d0952C6a91d7c7043dbc",
      fromBlock: 22174000,
    },
    TermMax4626Factory: [
      { address: "0xD594eb03a43b4974Aa7B32b5740cdeCe961151Fa", fromBlock: 23489745 },
      { address: "0x3Cc88086C0a613970565C96F9a1b6BdAd61C5f14", fromBlock: 24790495 },
    ],
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
    TermMax4626Factory: [
      { address: "0x3d2C215DE72877c3611cD0A9D8d69f60f1a5dB93", fromBlock: 12150722 },
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
  bsquared: {
    FactoryV2: [
      {
        address: "0x33931f3898EfB9A42B0D7CFfa9bb50A566A6b421",
        fromBlock: 28981154,
      },
    ],
    VaultFactoryV2: [
      {
        address: "0x276C0E52508d94ff2D4106b1559c8c4Bc3a75dec",
        fromBlock: 28981154,
      },
    ],
    TermMax4626Factory: [
      { address: "0xa50929A67daF9Ff3567e2Bb3411204A134f72546", fromBlock: 28981154 },
    ],
  },
  xlayer: {
    FactoryV2: [
      {
        address: "0xFaD175CAf9B0Ac0EBca3B1816ec799884EB04B9c",
        fromBlock: 50664655,
      },
    ],
    VaultFactoryV2: [
      {
        address: "0x2e1c769A9BA8248C7c8128c2BEBa11331ebF98Aa",
        fromBlock: 50664655,
      },
    ],
    TermMax4626Factory: [
      { address: "0xDA4aAF85Bb924B53DCc2DFFa9e1A9C2Ef97aCFDF", fromBlock: 50664655 },
    ],
  },
  base: {
    FactoryV2: [
      {
        address: "0xa6875Af7a45BEf941e484b59C149E5C1772DE643",
        fromBlock: 43289754,
      },
    ],
    VaultFactoryV2: [
      {
        address: "0xDA4aAF85Bb924B53DCc2DFFa9e1A9C2Ef97aCFDF",
        fromBlock: 43289755,
      },
    ],
    TermMax4626Factory: [
      { address: "0xa50929A67daF9Ff3567e2Bb3411204A134f72546", fromBlock: 43289755 },
    ],
  },
  pharos: {
    FactoryV2: [
      {
        address: "0xEDC206E67eAc5C949c0a90A02E29B4b2791c8395",
        fromBlock: 5243188,
      },
    ],
    VaultFactoryV2: [
      {
        address: "0x5316b0d2Ee13C81E243226D6BB93CF29FBf95837",
        fromBlock: 5243205,
      },
    ],
    TermMax4626Factory: [
      { address: "0xBa38C4D39ECf8401d90e7469dc6eB438547caC81", fromBlock: 5243210 },
    ],
  },
};

const VAULT_BLACKLIST = {
  arbitrum: [
    "0x8531dC1606818A3bc3D26207a63641ac2F1f6Dc8", // misconfigured asset
  ],
  ethereum: [
    "0x5c16d84e998c661d9f6c7cc23e1144e4b7f39759",
  ],
  bsc: [
    "0xe5E01B82904a49Ce5a670c1B7488C3f29433088a", // misconfigured asset
  ],
};

// uBTC markets excluded: TVL inflated by minter-funded wallets and borrow-redeposit loops
const MARKET_BLACKLIST = {
  bsquared: [
    "0x5022B6563f6bc9f0D47F407ba32B64e1f438213a", // uBTC/WBTC
  ],
};

// Extra ERC20s that may sit alongside the underlying inside a
// StableERC4626ForCustomize pool's Gnosis Safe `thirdPool` (e.g. XAUe held next
// to XAUt).
//
// DefiLlama's price service has no oracle for XAUe, so reading its balance
// directly would silently drop ~$18M on Ethereum. Each entry therefore carries
// a `priceableToken` + `divisor` so the raw balance is converted to an
// equivalent raw amount of a token DefiLlama can price.
//
// XAUe: 1 token = 0.001 troy oz, 18 decimals.
// XAUt: 1 token = 1 troy oz, 6 decimals.
// raw_xaut = raw_xaue * 0.001 / 10^18 * 10^6 = raw_xaue / 10^15.
const SAFE_EQUIVALENT_TOKENS = {
  ethereum: [
    {
      token: "0xd5D6840ed95F58FAf537865DcA15D5f99195F87a", // XAUe
      priceableToken: "0x68749665FF8D2d112Fa859AA293F07A622782F38", // XAUt
      divisor: 10n ** 15n,
    },
  ],
};

// TermMaxViewer (per-chain). Used to surface unclaimed pool rewards for
// ERC4626 pools whose principal sits in another ERC4626 (For4626 + Customize-
// ERC20). Aave-backed pools must NOT use this — accrued interest already
// rebases into the aToken balance, so adding rewards here would double-count.
const TERMMAX_VIEWER_ADDRESS = {
  ethereum:  "0xf574c1d7C18E250c341bdFb478cafefcaCbAbF09",
  arbitrum:  "0x012BFcbAC9EdEa04DFf07Cc61269E321f4595DfF",
  bsc:       "0x80906014B577AFd760528FA8B32304A49806580C",
  berachain: "0x37Ba9934aAbA7a49cC29d0952C6a91d7c7043dbc",
  bsquared:  "0x0d64B9feF3E1f599B88d29Edb54D2F9152CBE496",
  xlayer:    "0xaaa2108dF9c3Aa4d358275340733476d139A1445",
  base:      "0x0d64B9feF3E1f599B88d29Edb54D2F9152CBE496",
  pharos:    "0x0c30Bd74f891D88E69C07DEb5Ae9dA40C974BfeD",
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
    .concat(marketV2Addresses)
    .filter(addr => !MARKET_BLACKLIST[api.chain]?.includes(addr));
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
  const [vaultV1Addresses, vaultV1PlusAddresses] = await Promise.all([
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

  const assets = await api.multiCall({ abi: ABIS.Vault.asset, calls: vaultV2Addresses, })
  /*
    const tokensAndOwners = assets.map((asset, idx) => ({ target: asset, params: vaultV2Addresses[idx] }));
     const assets1 = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaultV2Addresses, })
    const tokens = await api.multiCall({ abi: 'string:symbol', calls: assets })
    const tokenBals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokensAndOwners })
    const table = []
  
    vaultV2Addresses.forEach((vault, i) => {
      let bal = assets1[i] / 1e18
      let tokenBal = tokenBals[i] / 1e18
      if (tokens[i].includes('USD')) {
        bal = assets1[i] / 1e6
        tokenBal = tokenBals[i] / 1e6
      }
      table.push({ vault, asset: assets[i], symbol: tokens[i], totalAssets: bal, tokenBalance: tokenBal, chain: api.chain })
    })
    console.table(table) 
    */
  // console.log('TermMax V2 Vaults found:', vaultV2Addresses, assets, tokens, api.chain);
  await sumTokens2({ api, tokensAndOwners2: [assets, vaultV2Addresses] });
}

async function addTermMaxMarketV2Tvl(api) {
  if (!ADDRESSES[api.chain].MarketV2Factory) return [];
  const tokensAndOwners = [];
  for (const factory of ADDRESSES[api.chain].MarketV2Factory) {
    const factoryLogs = await getLogs({
      api,
      eventAbi: 'event MarketInitialized (address indexed collateral, address indexed underlying, uint64 maturity, address ft, address xt, address gt)',
      fromBlock: factory.fromBlock,
      target: factory.address,
      onlyArgs: true,
      extraKey: `termmax-market-v2-${api.chain}`,
    });
    factoryLogs.forEach(log => tokensAndOwners.push([log.collateral, log.gt]));
  }

  await sumTokens2({ api, tokensAndOwners });
}

async function getTermMaxOwnerTokens(api) {
  const [marketOwnerTokens, vaultOwnerTokens] = await Promise.all([
    getTermMaxMarketOwnerTokens(api),
    getTermMaxVaultOwnerTokens(api),
  ]);
  await recordVaultV2Assets(api);
  await addTermMaxMarketV2Tvl(api)
  const ownerTokens = [].concat(marketOwnerTokens).concat(vaultOwnerTokens);
  return ownerTokens;
}

async function getTermStructureTvl(api) {

  const zkTrueUpContractAddress = ADDRESSES[api.chain].zkTrueUpContractAddress;
  if (!zkTrueUpContractAddress) return;

  const infoAbi =
    "function getAssetConfig(uint16 tokenId) external view returns (bool isStableCoin, bool isTsbToken, uint8 decimals, uint128 minDepositAmt, address token)";
  const tokenInfo = await api.fetchList({
    lengthAbi: "getTokenNum",
    itemAbi: infoAbi,
    target: zkTrueUpContractAddress,
    startFrom: 1,
  });
  const tokens = tokenInfo.map((i) => i.token);
  tokens.push(CORE_ASSETS.ethereum.WETH);

  await sumTokens2({ api, tokens, owners: [zkTrueUpContractAddress] });
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

async function getTermMaxV2MarketBorrowed(api) {
  const marketAddresses = (await getTermMaxMarketV2Addresses(api)).filter(addr => !MARKET_BLACKLIST[api.chain]?.includes(addr));
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

async function erc4626VaultsTvl(api) {
  if (!ADDRESSES[api.chain].TermMax4626Factory) return;
  const tokensAndOwners = [];
  const stableERC4626For4626Vaults = [];
  const aaveVaults = [];
  const customizeVaults = [];

  for (const factory of ADDRESSES[api.chain].TermMax4626Factory) {
    let logs = await getLogs2({
      api,
      eventAbi: EVENTS.TermMax4626Factory.StableERC4626For4626Created,
      fromBlock: factory.fromBlock,
      target: factory.address,
      extraKey: 'StableERC4626For4626Created-20260206',
    });
    stableERC4626For4626Vaults.push(...logs.map(i => i.stableERC4626For4626));

    logs = await getLogs2({
      api,
      eventAbi: EVENTS.TermMax4626Factory.StableERC4626ForAaveCreated,
      fromBlock: factory.fromBlock,
      target: factory.address,
      extraKey: 'StableERC4626ForAaveCreated-20260206',
    });
    aaveVaults.push(...logs.map(i => i.stableERC4626ForAave));


    logs = await getLogs2({
      api,
      eventAbi: EVENTS.TermMax4626Factory.VariableERC4626ForAaveCreated,
      fromBlock: factory.fromBlock,
      target: factory.address,
      extraKey: 'VariableERC4626ForAaveCreated-20260206',
    });
    aaveVaults.push(...logs.map(i => i.variableERC4626ForAave));

    logs = await getLogs2({
      api,
      eventAbi: EVENTS.TermMax4626Factory.StableERC4626ForCustomizeCreated,
      fromBlock: factory.fromBlock,
      target: factory.address,
      extraKey: 'StableERC4626ForCustomizeCreated-20260429',
    });
    customizeVaults.push(...logs.map(i => i.stableERC4626ForCustomize));
  }

  const aTokens = await api.multiCall({ abi: 'address:aToken', calls: aaveVaults })
  const aUnderlyings = await api.multiCall({ abi: 'address:underlying', calls: aaveVaults })
  aaveVaults.forEach((vault, i) => {
    tokensAndOwners.push([aUnderlyings[i], vault])
    tokensAndOwners.push([aTokens[i], vault])
  })

  const stableUnderlyings = await api.multiCall({ abi: 'address:underlying', calls: stableERC4626For4626Vaults })
  const thirdPools = await api.multiCall({ abi: 'address:thirdPool', calls: stableERC4626For4626Vaults })  // morpho vaults?
  stableERC4626For4626Vaults.forEach((vault, i) => {
    tokensAndOwners.push([stableUnderlyings[i], vault])
    tokensAndOwners.push([thirdPools[i], vault])
  })

  // StableERC4626ForCustomize: thirdPool may be either an ERC4626/ERC20 (same
  // accrual story as For4626) OR a Gnosis Safe (XAUt vault on Ethereum). Probe
  // totalSupply() to disambiguate — the Safe contract does not implement it.
  // Dedupe on (underlying, safe) and on safe alone — multiple vaults can share
  // a Safe, and we must count its holdings once.
  const customizeUnderlyings = await api.multiCall({ abi: 'address:underlying', calls: customizeVaults })
  const customizeThirdPools = await api.multiCall({ abi: 'address:thirdPool', calls: customizeVaults })
  const thirdPoolSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: customizeThirdPools, permitFailure: true })
  const seenSafeOwners = new Set();
  const safeBackedSafes = new Set();
  customizeVaults.forEach((vault, i) => {
    const underlying = customizeUnderlyings[i];
    const thirdPool = customizeThirdPools[i];
    const isErc20ThirdPool = thirdPoolSupplies[i] !== null;
    if (isErc20ThirdPool) {
      tokensAndOwners.push([underlying, vault]);
      tokensAndOwners.push([thirdPool, vault]);
    } else {
      const key = `${underlying.toLowerCase()}|${thirdPool.toLowerCase()}`;
      if (!seenSafeOwners.has(key)) {
        seenSafeOwners.add(key);
        tokensAndOwners.push([underlying, thirdPool]);
      }
      safeBackedSafes.add(thirdPool.toLowerCase());
    }
  })

  await sumTokens2({ api, tokensAndOwners });
  await addSafeEquivalentBalances(api, [...safeBackedSafes]);
  await addUnclaimedPoolRewards(api, {
    stableERC4626For4626Vaults,
    stableUnderlyings,
    customizeVaults,
    customizeUnderlyings,
    thirdPoolSupplies,
  });
}

// XAUe and similar non-priceable equivalents are remapped to a priceable
// canonical token (e.g. XAUt) at a fixed raw-unit ratio. balanceOf is batched
// over (safe x equivalent) pairs.
async function addSafeEquivalentBalances(api, safeAddresses) {
  if (safeAddresses.length === 0) return;
  const equivalents = SAFE_EQUIVALENT_TOKENS[api.chain] ?? [];
  if (equivalents.length === 0) return;

  const calls = [];
  for (const safe of safeAddresses) {
    for (const eq of equivalents) {
      calls.push({ target: eq.token, params: [safe] });
    }
  }
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls });

  let idx = 0;
  for (const safe of safeAddresses) {
    for (const eq of equivalents) {
      const raw = BigInt(balances[idx++] ?? '0');
      if (raw === 0n) continue;
      const remapped = raw / eq.divisor;
      if (remapped === 0n) continue;
      api.add(eq.priceableToken, remapped.toString());
    }
  }
}

// For4626 and Customize-ERC20 pools route deposits into another ERC4626 where
// yield surfaces only as share-price appreciation. The pool's totalAssets()
// returns principal-only (1:1 share), so we ask TermMaxViewer for the accrued
// reward and add it to the underlying balance. Skip pools whose reward asset
// differs from the pool's underlying — summing them as underlying would be
// unit-incorrect.
async function addUnclaimedPoolRewards(api, params) {
  const viewerAddress = TERMMAX_VIEWER_ADDRESS[api.chain];
  if (!viewerAddress) return;

  const {
    stableERC4626For4626Vaults,
    stableUnderlyings,
    customizeVaults,
    customizeUnderlyings,
    thirdPoolSupplies,
  } = params;

  const pools = [];
  const poolUnderlyings = [];
  stableERC4626For4626Vaults.forEach((vault, i) => {
    pools.push(vault);
    poolUnderlyings.push(stableUnderlyings[i]);
  });
  customizeVaults.forEach((vault, i) => {
    if (thirdPoolSupplies[i] === null) return; // Safe-backed: no viewer dispatch
    pools.push(vault);
    poolUnderlyings.push(customizeUnderlyings[i]);
  });
  if (pools.length === 0) return;

  let result;
  try {
    result = await api.call({
      abi: ABIS.Viewer.getPoolUnclaimedRewards,
      target: viewerAddress,
      params: [pools],
    });
  } catch (err) {
    console.warn(`TermMaxViewer.getPoolUnclaimedRewards failed on ${api.chain}`, err.message ?? err);
    return;
  }

  const { asset, amount } = result;
  for (let i = 0; i < pools.length; i += 1) {
    const rewardAsset = asset[i];
    const rewardAmount = amount[i] ?? '0';
    if (!rewardAsset || rewardAsset.toLowerCase() !== poolUnderlyings[i].toLowerCase()) {
      if (rewardAmount && BigInt(rewardAmount) > 0n) {
        console.warn(`TermMaxViewer reward asset ${rewardAsset} differs from underlying ${poolUnderlyings[i]} for pool ${pools[i]} on ${api.chain}; skipping`);
      }
      continue;
    }
    api.add(rewardAsset, rewardAmount);
  }
}

module.exports = {
  hallmarks: [
    [
      "2025-04-15",
      "Sunset Term Structure and launch TermMax",
    ],
  ],
}

Object.keys(ADDRESSES).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      await erc4626VaultsTvl(api)
      await getTermStructureTvl(api)
      const ownerTokens = await getTermMaxOwnerTokens(api);
      return sumTokens2({ api, ownerTokens })
    },
    borrowed: async (api) => {
      await Promise.all([
        getTermMaxMarketBorrowed(api),
        getTermMaxV2MarketBorrowed(api),
      ]);
    },
  }
})
