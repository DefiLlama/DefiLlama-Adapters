/**
 **
 **
 **
 ** This file has been generated from source code in https://github.com/Gearbox-protocol/defillama repo
 ** Binary release: https://github.com/Gearbox-protocol/defillama/releases/tag/v1.6.6
 **
 **
 **
 **/

 var ethers = require("ethers");
 var getLogs = require("../helper/cache/getLogs");
 
 // src/adapter/constants.ts
 var ADDRESS_PROVIDER_V300 = {
   ethereum: "0x9ea7b04da02a5373317d745c1571c84aad03321d",
   arbitrum: "0x7d04eCdb892Ae074f03B5D0aBA03796F90F3F2af",
   optimism: "0x3761ca4BFAcFCFFc1B8034e69F19116dD6756726",
   sonic: "0x4b27b296273B72d7c7bfee1ACE93DC081467C41B",
 };
 
 // src/adapter/pools/abi.ts
 var poolAbis = {
   getAddressOrRevert:
     "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
   getPools: "function getPools() view returns (address[])",
   underlyingToken: "function underlyingToken() view returns (address)",
 };
 
 // src/adapter/pools/index.ts
 async function getPools(block, api) {
   const target = ADDRESS_PROVIDER_V300[api.chain];
   if (!target) {
     return [];
   }
   const contractsRegisterAddr = await api.call({
     block,
     abi: poolAbis["getAddressOrRevert"],
     target,
     params: [
       // cast format-bytes32-string "CONTRACTS_REGISTER"
       "0x434f4e5452414354535f52454749535445520000000000000000000000000000",
       0,
     ],
   });
   let pools = await api.call({
     abi: poolAbis["getPools"],
     target: contractsRegisterAddr,
     block,
   });
   pools = pools.filter(
     (p) => p !== "0xB8cf3Ed326bB0E51454361Fb37E9E8df6DC5C286"
   );
   const underlyings = await api.multiCall({
     abi: poolAbis["underlyingToken"],
     calls: pools.map((target2) => ({ target: target2 })),
     block,
   });
   const balances = await api.multiCall({
     abi: "erc20:balanceOf",
     calls: pools.map((p, i) => ({ target: underlyings[i], params: [p] })),
     permitFailure: true,
   });
   return balances.map((b, i) => ({
     addr: pools[i],
     token: underlyings[i],
     bal: b,
   }));
 }
 
 // src/adapter/v1/abi.ts
 var v1Abis = {
   getAddressOrRevert:
     "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
   getCreditManagers: "function getCreditManagers() view returns (address[])",
   version: "function version() view returns (uint256)",
   underlyingToken: "function underlyingToken() view returns (address)",
   calcTotalValue:
     "function calcTotalValue(address creditAccount) view returns (uint256 total)",
   filtersV1: [
     "event CloseCreditAccount(address indexed owner, address indexed to, uint256 remainingFunds)",
     "event OpenCreditAccount(address indexed sender, address indexed onBehalfOf, address indexed creditAccount, uint256 amount, uint256 borrowAmount, uint256 referralCode)",
     "event RepayCreditAccount(address indexed owner, address indexed to)",
     "event TransferAccount(address indexed oldOwner, address indexed newOwner)",
     "event LiquidateCreditAccount(address indexed owner, address indexed liquidator, uint256 remainingFunds)",
   ],
   creditFilter: "function creditFilter() view returns (address addr)",
 };
 
 // src/adapter/v1/index.ts
 async function getV1TVL(block, api) {
   const creditManagers = await getCreditManagersV1(block, api);
   if (!creditManagers[0]) return [];
   const caValues = await Promise.all(
     creditManagers.map((cm) => getV1CAs(cm.addr, block, api))
   );
   return creditManagers.map((cm, i) => ({
     addr: cm.addr,
     token: cm.underlying,
     bal: caValues[i],
   }));
 }
 async function getCreditManagersV1(block, api) {
   const contractsRegisterAddr = await api.call({
     block,
     abi: v1Abis["getAddressOrRevert"],
     target: ADDRESS_PROVIDER_V300[api.chain],
     params: [
       // cast format-bytes32-string "CONTRACTS_REGISTER"
       "0x434f4e5452414354535f52454749535445520000000000000000000000000000",
       0,
     ],
   });
   const creditManagers = await api.call({
     abi: v1Abis["getCreditManagers"],
     target: contractsRegisterAddr,
     block,
   });
   const versions = await api.multiCall({
     abi: v1Abis["version"],
     calls: creditManagers.map((target) => ({ target })),
     block,
   });
   const v1Managers = [];
   for (let i = 0; i < creditManagers.length; i++) {
     const addr = creditManagers[i];
     const version = versions[i];
     if (version === "1") {
       v1Managers.push(addr);
     }
   }
   const underlyings = await api.multiCall({
     abi: v1Abis["underlyingToken"],
     calls: v1Managers.map((target) => ({ target })),
     block,
   });
   return v1Managers.map((addr, i) => ({ addr, underlying: underlyings[i] }));
 }
 async function getV1CAs(creditManager, block, api) {
   if (creditManager === "0x4C6309fe2085EfE7A0Cfb426C16Ef3b41198cCE3") {
     return "0";
   }
   const eventsByDate = [];
   const accounts = /* @__PURE__ */ new Set();
   const addToEvents = (e, address, operation) => {
     eventsByDate.push({
       time: e.blockNumber * 1e5 + e.logIndex,
       address,
       operation,
     });
   };
   const cf = await api.call({
     abi: v1Abis["creditFilter"],
     target: creditManager,
     block,
   });
   const cm = new ethers.Contract(creditManager, v1Abis["filtersV1"]);
   const topics = [];
   cm.interface.forEachEvent((e) => topics.push(e.topicHash));
   const rawLogs = await getLogs.getLogs({
     target: creditManager,
     fromBlock: 13854983,
     toBlock: block,
     api,
     topics: [topics],
   });
   const logs = rawLogs.map((log) => ({
     ...cm.interface.parseLog(log),
     blockNumber: log.blockNumber,
     logIndex: log.logIndex,
   }));
   logs.forEach((log) => {
     switch (log.name) {
       case "OpenCreditAccount":
         addToEvents(log, log.args.onBehalfOf, "add");
         break;
       case "CloseCreditAccount":
       case "LiquidateCreditAccount":
       case "RepayCreditAccount":
         addToEvents(log, log.args.borrower, "delete");
         break;
       case "TransferAccount":
         addToEvents(log, log.args.oldOwner, "delete");
         addToEvents(log, log.args.newOwner, "add");
         break;
     }
   });
   eventsByDate
     .sort((a, b) => {
       return a.time - b.time;
     })
     .forEach((e) => {
       if (e.operation === "add") {
         accounts.add(e.address);
       } else {
         accounts.delete(e.address);
       }
     });
   const openCAs = Array.from(accounts.values()).map(
     (borrower) =>
       logs.find((log) => log.args?.onBehalfOf === borrower)?.args.creditAccount
   );
   const totalValue = await api.multiCall({
     abi: v1Abis["calcTotalValue"],
     target: cf,
     calls: openCAs.filter(
       (i) => i !== "0xaBBd655b3791175113c1f1146D3B369494A2b815"
     ),
     // filtered out address throwing error
     block,
   });
   return totalValue.reduce((a, c) => a + BigInt(c), BigInt(0)).toString();
 }
 
 // src/adapter/v2/abi.ts
 var v2Abis = {
   calcTotalValue:
     "function calcTotalValue(address creditAccount) view returns (uint256 total)",
   getAddressOrRevert:
     "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
   getCreditManagersV2List:
     "function getCreditManagersV2List() view returns (tuple(address addr, string name, uint256 cfVersion, address creditFacade, address creditConfigurator, address underlying, address pool, uint256 totalDebt, uint256 totalDebtLimit, uint256 baseBorrowRate, uint256 minDebt, uint256 maxDebt, uint256 availableToBorrow, address[] collateralTokens, tuple(address targetContract, address adapter)[] adapters, uint256[] liquidationThresholds, bool isDegenMode, address degenNFT, uint256 forbiddenTokenMask, uint8 maxEnabledTokensLength, uint16 feeInterest, uint16 feeLiquidation, uint16 liquidationDiscount, uint16 feeLiquidationExpired, uint16 liquidationDiscountExpired, tuple(address token, uint16 rate, uint16 quotaIncreaseFee, uint96 totalQuoted, uint96 limit, bool isActive)[] quotas, tuple(address interestModel, uint256 version, uint16 U_1, uint16 U_2, uint16 R_base, uint16 R_slope1, uint16 R_slope2, uint16 R_slope3, bool isBorrowingMoreU2Forbidden) lirm, bool isPaused)[])",
   creditFacade: "function creditFacade() view returns (address addr)",
   filtersV2: [
     "event OpenCreditAccount(address indexed onBehalfOf, address indexed creditAccount, uint256 borrowAmount, uint16 referralCode)",
     "event CloseCreditAccount(address indexed borrower, address indexed to)",
     "event LiquidateCreditAccount(address indexed borrower, address indexed liquidator, address indexed to, uint256 remainingFunds)",
     "event TransferAccount(address indexed oldOwner, address indexed newOwner)",
     "event LiquidateExpiredCreditAccount(address indexed borrower, address indexed liquidator, address indexed to, uint256 remainingFunds)",
   ],
 };
 
 // src/adapter/v2/index.ts
 async function getV2TVL(block, api) {
   const creditManagers = await getCreditManagersV210(block, api);
   if (!creditManagers[0]) return [];
   const caValues = await Promise.all(
     creditManagers.map((cm) => getV2CAs(cm.addr, block, api))
   );
   return creditManagers.map((cm, i) => ({
     addr: cm.addr,
     token: cm.underlying,
     bal: caValues[i],
   }));
 }
 async function getCreditManagersV210(block, api) {
   const dataCompressor210 = await api.call({
     abi: v2Abis["getAddressOrRevert"],
     target: ADDRESS_PROVIDER_V300[api.chain],
     params: [
       // cast format-bytes32-string "DATA_COMPRESSOR"
       "0x444154415f434f4d50524553534f520000000000000000000000000000000000",
       210,
     ],
     block,
   });
   return api.call({
     // IDataCompressorV2_10__factory.createInterface().getFunction("getCreditManagersV2List").format(ethers.utils.FormatTypes.full)
     abi: v2Abis["getCreditManagersV2List"],
     target: dataCompressor210,
     block,
   });
 }
 async function getV2CAs(creditManager, block, api) {
   const fromBlock = 13854983;
   const eventsByDate = [];
   const accounts = /* @__PURE__ */ new Set();
   const creditFacade = await api.call({
     abi: v2Abis["creditFacade"],
     target: creditManager,
     block,
   });
   const ccLogs = await getLogs.getLogs({
     target: creditManager,
     fromBlock,
     toBlock: block,
     api,
     onlyArgs: true,
     eventAbi: "event NewConfigurator(address indexed newConfigurator)",
   });
   const ccAddrs = ccLogs.map((l) => l[0]);
   const cfAddrs = [];
   for (let cca of ccAddrs) {
     const cfLogs = await getLogs.getLogs({
       target: cca,
       fromBlock,
       api,
       onlyArgs: true,
       eventAbi: "event CreditFacadeUpgraded(address indexed newCreditFacade)",
     });
     const cfs = cfLogs.map((l) => l[0]);
     cfAddrs.push(...cfs);
   }
   const addToEvents = (e, address, operation) => {
     eventsByDate.push({
       time: e.blockNumber * 1e5 + e.logIndex,
       address,
       operation,
       ca: e.args.creditAccount ? e.args.creditAccount : null,
       cf: creditFacade,
     });
   };
   const logs = [];
   for (let cfAddr of cfAddrs) {
     const cf = new ethers.Contract(cfAddr, v2Abis["filtersV2"]);
     const topics = [];
     cf.interface.forEachEvent((e) => topics.push(e.topicHash));
     const rawLogs = await getLogs.getLogs({
       target: cfAddr,
       fromBlock,
       api,
       topics: [topics],
     });
     const cfLogs = rawLogs.map((log) => ({
       ...cf.interface.parseLog(log),
       blockNumber: log.blockNumber,
       logIndex: log.logIndex,
     }));
     logs.push(...cfLogs);
   }
   logs.forEach((log) => {
     switch (log.name) {
       case "OpenCreditAccount":
         addToEvents(log, log.args.onBehalfOf, "add");
         break;
       case "CloseCreditAccount":
       case "LiquidateCreditAccount":
       case "LiquidateExpiredCreditAccount":
         addToEvents(log, log.args.borrower, "delete");
         break;
       case "TransferAccount":
         addToEvents(log, log.args.oldOwner, "delete");
         addToEvents(log, log.args.newOwner, "add");
         break;
     }
   });
   eventsByDate
     .sort((a, b) => {
       return a.time - b.time;
     })
     .forEach((e) => {
       if (e.operation === "add") {
         accounts.add(e.address);
       } else {
         accounts.delete(e.address);
       }
     });
   const openCAs = Array.from(accounts.values()).map(
     (borrower) =>
       logs
         .sort((a, b) => b.blockNumber - a.blockNumber)
         .find((log) => log.args?.onBehalfOf === borrower).args.creditAccount
   );
   const totalValue = await api.multiCall({
     abi: v2Abis["calcTotalValue"],
     target: creditFacade,
     calls: openCAs,
   });
   return totalValue[0]
     ? totalValue.reduce((a, c) => a + BigInt(c), BigInt(0)).toString()
     : "0";
 }
 
 // src/adapter/v31/constants.ts
 var LEGACY_MARKET_CONFIGURATORS = {
   ethereum: [
     "0x354fe9f450F60b8547f88BE042E4A45b46128a06",
     // Chaos Labs
     "0x4d427D418342d8CE89a7634c3a402851978B680A",
     // K3
   ],
   arbitrum: [
     "0x01023850b360b88de0d0f84015bbba1eba57fe7e",
     // "Chaos Labs",
   ],
   optimism: [
     "0x2a15969CE5320868eb609680751cF8896DD92De5",
     // "Chaos Labs",
   ],
   sonic: [
     "0x8FFDd1F1433674516f83645a768E8900A2A5D076",
     // "Chaos Labs",
   ],
 };
 var DEFILLAMA_COMPRESSOR_V310 = "0x81cb9eA2d59414Ab13ec0567EFB09767Ddbe897a";
 
 // src/adapter/v31/abi.ts
 var iAddressProviderAbi = {
   getAddressOrRevert:
     "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
 };
 var iDefillamaCompressorAbi = {
   getLegacyCreditManagers:
     "function getCreditManagers(address[] memory configurators) external view returns (address[] memory creditManagers)",
   getCreditManagers:
     "function getCreditManagers() external view returns (address[] memory creditManagers)",
   getLegacyPools:
     "function getPools(address[] memory configurators) external view returns (tuple(address pool, address underlying, uint256 availableLiquidity, uint256 totalBorrowed)[] memory pools)",
   getPools:
     "function getPools() external view returns (tuple(address pool, address underlying, uint256 availableLiquidity, uint256 totalBorrowed)[] memory pools)",
   getCreditAccounts:
     "function getCreditAccounts(address creditManager, uint256 offset, uint256 limit) external view returns (tuple(address creditAccount, uint256 debt, tuple(address token, uint256 balance)[] tokens)[] memory data)",
 };
 var abi_default = {
   ...iAddressProviderAbi,
   ...iDefillamaCompressorAbi,
 };
 
 // src/adapter/v31/utils.ts
 function mergePools(a, b) {
   const pools = a.map((p) => p.addr.toLowerCase());
   return [...a, ...b.filter((p) => !pools.includes(p.addr.toLowerCase()))];
 }
 function accountToTokenAndOwner(account) {
   return account.tokens
     .filter((t) => BigInt(t.balance) > 1n)
     .map((t) => ({
       addr: account.creditAccount.toLowerCase(),
       token: t.token.toLowerCase(),
       bal: t.balance,
     }));
 }
 
 // src/adapter/v31/implementation.ts
 async function getV310PoolsBorrowed(block, api) {
   const pools = await loadPools(block, api);
   return pools.map((pool) => ({
     addr: pool.pool,
     bal: pool.totalBorrowed,
     token: pool.underlying,
   }));
 }
 async function getV310PoolsAvailable(block, api) {
   const pools = await loadPools(block, api);
   return pools.map((pool) => ({
     addr: pool.pool,
     bal: pool.availableLiquidity,
     token: pool.underlying,
   }));
 }
 async function getV310CreditAccounts(block, api) {
   const cms = await loadCreditManagers(block, api);
   const allAccounts = [];
   for (const cm of cms) {
     let accounts = await loadCreditAccounts(block, api, cm);
     accounts = accounts.filter((a) => Number(a.debt) !== 0);
     allAccounts.push(...accounts);
   }
   return allAccounts.flatMap(accountToTokenAndOwner);
 }
 async function loadPools(block, api) {
   const legacyMcs = LEGACY_MARKET_CONFIGURATORS[api.chain];
   const promises = [
     api.call({
       abi: abi_default.getPools,
       target: DEFILLAMA_COMPRESSOR_V310,
       params: [],
       block,
     }),
   ];
   if (legacyMcs?.length) {
     promises.push(
       api.call({
         abi: abi_default.getLegacyPools,
         target: DEFILLAMA_COMPRESSOR_V310,
         params: [legacyMcs],
         block,
       })
     );
   }
   const allPools = await Promise.all(promises);
   return allPools.flat();
 }
 async function loadCreditManagers(block, api) {
   const legacyMcs = LEGACY_MARKET_CONFIGURATORS[api.chain];
   const promises = [
     api.call({
       abi: abi_default.getCreditManagers,
       target: DEFILLAMA_COMPRESSOR_V310,
       params: [],
       block,
     }),
   ];
   if (legacyMcs?.length) {
     promises.push(
       api.call({
         abi: abi_default.getLegacyCreditManagers,
         target: DEFILLAMA_COMPRESSOR_V310,
         params: [legacyMcs],
         block,
       })
     );
   }
   const allCMs = await Promise.all(promises);
   return allCMs.flat();
 }
 async function loadCreditAccounts(block, api, creditManager, limit = 1e3) {
   let offset = 0;
   let creditAccounts = [];
   const result = [];
   do {
     creditAccounts = await loadCreditAccountsPage(
       block,
       api,
       creditManager,
       offset,
       limit
     );
     result.push(...creditAccounts);
     offset += limit;
   } while (creditAccounts.length === limit);
   return result;
 }
 async function loadCreditAccountsPage(
   block,
   api,
   creditManager,
   offset,
   limit
 ) {
   const creditAccounts = await api.call({
     abi: abi_default.getCreditAccounts,
     target: DEFILLAMA_COMPRESSOR_V310,
     params: [creditManager, offset, limit],
     block,
   });
   return creditAccounts;
 }
 
 // src/adapter/index.ts
 async function tvl(_timestamp, _block, _, { api }) {
   const allBalances = [];
   const block = await api.getBlock();
   const legacyPools = await getPools(block, api);
   const poolsV310 = await getV310PoolsAvailable(block, api);
   const pools = mergePools(legacyPools, poolsV310);
   allBalances.push(...pools);
   if (api.chain === "ethereum") {
     const v1Balances = await getV1TVL(block, api);
     const v2Balances = await getV2TVL(block, api);
     allBalances.push(...v1Balances, ...v2Balances);
   }
   const v310Balances = await getV310CreditAccounts(block, api);
   allBalances.push(...v310Balances);
   for (const i of allBalances) {
     api.add(i.token, i.bal);
   }
 }
 async function borrowed(_timestamp, _block, _, { api }) {
   const block = await api.getBlock();
   const borrowed2 = await getV310PoolsBorrowed(block, api);
   for (const { token, bal } of borrowed2) {
     api.add(token, bal);
   }
 }
 var adapter_default = {
   ...Object.fromEntries(
     [
       "ethereum",
       "arbitrum",
       "optimism",
       "sonic",
       "bsc",
       "hemi",
       "lisk",
       "etlk",
       "plasma",
       "monad",
       "somnia",
     ].map((n) => [n, { tvl, borrowed }])
   ),
   hallmarks: [[1666569600, "LM begins"]],
   methodology: `Retrieves the tokens in each Gearbox pool & value of all Credit Accounts (V1/V2/V3) denominated in the underlying token.`,
   misrepresentedTokens: true,
 };
 
 module.exports = adapter_default;
 