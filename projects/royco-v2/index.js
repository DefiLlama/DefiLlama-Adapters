const sdk = require("@defillama/sdk");
const { getLogs2 } = require("../helper/cache/getLogs");

// =============================================================================================
// TVL METHODOLOGY — NO DOUBLE-COUNTING
//
// Every dollar in this adapter is counted exactly once. TVL comes from three sources:
//
//   (1) Royco V2 markets (all chains): sum of senior + junior tranche `totalAssets()`.
//       This is the single source of truth for value held INSIDE Royco markets.
//
//   (2) srRoyUSDC vault (mainnet only): a Royco-issued vault product. Users deposit USDC and
//       receive the srRoyUSDC token; the vault custodies and manages those deposits, allocating
//       them across Royco markets and other yield venues. This whole vault balance is Royco's
//       OWN TVL — the same convention DefiLlama applies to curated-vault / aggregator products
//       such as Yearn vaults, whose deposited assets count toward the issuing protocol's TVL even
//       when the vault forwards them into underlying venues. So (2) is Royco TVL, not a third
//       party's.
//
//   (3) RoyWstEth vault (mainnet only): a Royco-issued wstETH vault. Users deposit wstETH; its
//       strategies supply it as Morpho collateral, borrow stablecoins, swap to USDC, and deposit
//       that USDC into the srRoyUSDC vault (2). We count the vault's wstETH NAV. Also Royco TVL.
//
// THE OVERLAPS (why subtractions are needed): a higher layer deposits into a lower one, so the same
// value can otherwise appear twice INSIDE Royco (this is internal de-duplication, not cross-protocol):
//   - (2) into (1): srRoyUSDC's strategies deposit into Royco markets, inflating the tranches'
//     `totalAssets()`. Fixed in `addSrRoyUsdc`: (2) contributes
//         srRoyUSDC.totalAssets()  -  (value its strategies hold inside Royco markets)
//     read on-chain from those strategies' tranche positions (balanceOf -> convertToAssets().nav).
//   - (3) into (2): RoyWstEth's strategies park borrowed USDC in srRoyUSDC, which (2) already counts.
//     Fixed in `addRoyWstEth`: we add (3)'s wstETH NAV and subtract that srRoyUSDC position
//     (balanceOf -> convertToAssets, in USDC) back out of (2).
// The position-holder addresses used for these subtractions are discovered ON-CHAIN, never
// hardcoded: vault.getStrategies(), resolving each Makina CROSSCHAIN strategy to its machine's hub
// caliber (getMakinaMachine().hubCaliber()) and leaving self-custody strategies as-is (see
// resolveStrategies). So the adapter self-updates if a vault's strategies change.
// Net effect: every deposit is counted once at its lowest layer, and NOTHING is counted twice.
// =============================================================================================

const config = {
    "ethereum": {
        factoryAddress: "0x7cc6fb28ec7b5e7afc3cb3986141797ffc27253c",
        factoryFromBlock: 24650849,
    },
    "avax": {
        factoryAddress: "0x7cc6fb28ec7b5e7afc3cb3986141797ffc27253c",
        factoryFromBlock: 80312789,
    },
    "arbitrum": {
        factoryAddress: "0x7cc6fb28ec7b5e7afc3cb3986141797ffc27253c",
        factoryFromBlock: 441493793,
    },
    "base": {
        factoryAddress: "0x568c9709daa2f7b7cc66abc3e41da0f0a339551a",
        factoryFromBlock: 48111449,
    },
};

const marketDeployedEventAbi = "event MarketDeployed((address seniorTranche, address juniorTranche, address kernel, address accountant) roycoMarket, (string seniorTrancheName, string seniorTrancheSymbol, string juniorTrancheName, string juniorTrancheSymbol, address seniorTrancheImplementation, address juniorTrancheImplementation, address kernelImplementation, address accountantImplementation, bytes seniorTrancheInitializationData, bytes juniorTrancheInitializationData, bytes kernelInitializationData, bytes accountantInitializationData, bytes32 seniorTrancheProxyDeploymentSalt, bytes32 juniorTrancheProxyDeploymentSalt, bytes32 kernelProxyDeploymentSalt, bytes32 accountantProxyDeploymentSalt, (address target, bytes4[] selectors, uint64[] roles)[] roles) params)";

const totalAssetsAbi = "function totalAssets() view returns ((uint256 stAssets, uint256 jtAssets, uint256 nav))";
// convertToAssets(shares) -> AssetClaims. `nav` is the position's value in USDC, expressed in
// the protocol's 18-decimal NAV_UNIT. stAssets/jtAssets are denominated in the tranche's own
// (post-swap) deposit token, so only `nav` is usable as a USDC figure here.
const convertToAssetsAbi = "function convertToAssets(uint256 _shares) view returns ((uint256 stAssets, uint256 jtAssets, uint256 nav))";

// srRoyUSDC vault (mainnet only), a Royco-issued vault product. Users deposit USDC and receive the
// srRoyUSDC token; the vault custodies and manages those deposits, allocating them across Royco
// markets and other yield venues. The full vault balance is Royco's OWN TVL (the same way
// Yearn-style vault deposits count toward the issuing protocol, even when forwarded to underlying
// venues). It is added to TVL MINUS the portion already counted inside Royco markets (see
// addSrRoyUsdc), purely so that in-market slice is not counted twice WITHIN Royco.
const srRoyUsdc = {
    chain: "ethereum",
    address: "0xcd9f5907f92818bc06c9ad70217f089e190d2a32",
    asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
};

// The srRoyUSDC and RoyWstEth vaults route deposits through on-chain "strategy" contracts, and
// whatever a strategy custodies inside a lower Royco layer is exactly the overlap we must
// de-duplicate. We DISCOVER the current position-holding addresses on-chain (never hardcode them)
// so the adapter self-updates if a vault's strategies change. The same resolved holder set is
// queried on every market chain; balanceOf simply returns 0 where a holder holds nothing.
//
// A strategy's positions do NOT necessarily sit at the strategy contract itself:
//   - CROSSCHAIN strategies are executed through a Makina hub-and-spoke machine, so their Royco
//     positions are custodied by the machine's hub caliber -> getMakinaMachine().hubCaliber().
//   - ATOMIC/ASYNC strategies self-custody, so the holder is the strategy address itself.
// enum StrategyType { ATOMIC, ASYNC, CROSSCHAIN } (from the Royco strategy contracts).
const STRATEGY_TYPE_CROSSCHAIN = 2;
const getStrategiesAbi = "function getStrategies() view returns (address[])";
const strategyTypeAbi = "function strategyType() view returns (uint8)";
const getMakinaMachineAbi = "function getMakinaMachine() view returns (address)";
const hubCaliberAbi = "function hubCaliber() view returns (address)";

// Resolves a vault's current position-holding addresses on-chain (see the StrategyType note above).
// These feed the de-duplication subtractions, so every call here is dedup-critical: NO
// permitFailure — a failure must fail the whole refresh rather than silently drop a holder and
// publish inflated, double-counted TVL.
const resolveStrategies = async (api, vault) => {
    const strategies = await api.call({ abi: getStrategiesAbi, target: vault });
    if (!strategies.length) return [];

    const types = await api.multiCall({ abi: strategyTypeAbi, calls: strategies });
    const crosschain = strategies.filter((_, i) => Number(types[i]) === STRATEGY_TYPE_CROSSCHAIN);
    const selfCustody = strategies.filter((_, i) => Number(types[i]) !== STRATEGY_TYPE_CROSSCHAIN);
    if (!crosschain.length) return selfCustody;

    // CROSSCHAIN => Makina: the real position-holder is the machine's hub caliber, not the strategy.
    const machines = await api.multiCall({ abi: getMakinaMachineAbi, calls: crosschain });
    const calibers = await api.multiCall({ abi: hubCaliberAbi, calls: machines });
    return [...selfCustody, ...calibers];
};

// NAV_UNIT (18 decimals, USDC-denominated) -> USDC (6 decimals)
const NAV_TO_USDC = 10n ** 12n;

// RoyWstEth vault (mainnet only), a Royco-issued wstETH vault. Users deposit wstETH; its strategies
// supply it as Morpho collateral, borrow stablecoins, swap to USDC, and deposit that USDC into the
// srRoyUSDC vault. Its wstETH NAV is Royco's own TVL; the borrowed USDC it parks in srRoyUSDC is
// already counted there, so we subtract that position to avoid double-counting the leveraged leg.
const royWstEth = {
    chain: "ethereum",
    address: "0x41ce72e04d349eb957bdc373baa9c69207032c56",
    asset: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // wstETH
};

// srRoyUSDC is a standard ERC4626 vault (asset = USDC), so its convertToAssets(shares) returns a
// plain USDC amount — unlike the market tranches' convertToAssets, which returns the struct above.
const srRoyUsdcConvertToAssetsAbi = "function convertToAssets(uint256 shares) view returns (uint256 assets)";

const getTranches = async (api) => {
    const { factoryAddress, factoryFromBlock } = config[api.chain];
    const marketDeployedLogs = await getLogs2({
        api,
        target: factoryAddress,
        eventAbi: marketDeployedEventAbi,
        fromBlock: factoryFromBlock,
    });
    return {
        seniorTranches: marketDeployedLogs.map(log => log.roycoMarket.seniorTranche),
        juniorTranches: marketDeployedLogs.map(log => log.roycoMarket.juniorTranche),
    };
};

const tvl = async (api) => {
    // Source (1): value held INSIDE Royco markets, counted exactly once here from the tranches.
    // Any srRoyUSDC deposits routed into these same tranches are captured by this sum, and are
    // therefore removed from the srRoyUSDC figure below (see addSrRoyUsdc) so they are not counted
    // a second time.
    const { seniorTranches, juniorTranches } = await getTranches(api);

    const seniorAssets = await api.multiCall({ abi: 'address:asset', calls: seniorTranches });
    const juniorAssets = await api.multiCall({ abi: 'address:asset', calls: juniorTranches });
    const stTotalAssets = await api.multiCall({ abi: totalAssetsAbi, calls: seniorTranches });
    const jtTotalAssets = await api.multiCall({ abi: totalAssetsAbi, calls: juniorTranches });

    stTotalAssets.forEach((result, i) => {
        api.add(seniorAssets[i], BigInt(result.stAssets));
    });

    jtTotalAssets.forEach((result, i) => {
        api.add(juniorAssets[i], BigInt(result.jtAssets));
    });

    // Source (2): srRoyUSDC lives on mainnet only; account for it once, when tvl runs for its
    // chain. addSrRoyUsdc subtracts the part already counted above so there is no double-counting.
    if (api.chain === srRoyUsdc.chain) {
        await addSrRoyUsdc(api);
    }

    // Source (3): RoyWstEth (mainnet only) — adds its wstETH NAV and removes the srRoyUSDC position
    // its strategies hold (already counted in (2)), so the borrowed leg is not double-counted.
    if (api.chain === royWstEth.chain) {
        await addRoyWstEth(api);
    }
};

// Adds srRoyUSDC's value to TVL WITHOUT double-counting. The full vault balance is Royco's own TVL,
// but `totalDeposits` (the vault's totalAssets) already includes the USDC the vault has placed into
// Royco markets — value that tvl()'s tranche sums above ALREADY count. We measure that in-market
// portion on-chain and subtract it, so the vault contributes only its remaining (not-yet-counted)
// deposits here. In-market dollars stay counted once (in the tranches), never twice.
const addSrRoyUsdc = async (api) => {
    // Total USDC held by the vault (Royco-market allocations + other yield venues + idle USDC).
    // This full balance is Royco's own TVL; we only net out the already-counted market slice below.
    const totalDeposits = BigInt(await api.call({ abi: 'uint256:totalAssets', target: srRoyUsdc.address }));

    // Discover srRoyUSDC's current position-holders once, on mainnet (api.chain === srRoyUsdc.chain
    // here, and the vault lives there). The resolved set is reused on every market chain below.
    const strategies = await resolveStrategies(api, srRoyUsdc.address);

    // The exact slice already counted by (1): the strategies' positions across every market chain,
    // summed as USDC (nav) and converted from NAV_UNIT (18 decimals) to USDC (6 decimals). This is
    // the in-Royco overlap we cancel out — subtracting it makes the two Royco sources mutually
    // exclusive.
    let navInMarkets = 0n;
    for (const chain of Object.keys(config)) {
        const chainApi = chain === api.chain ? api : new sdk.ChainApi({ chain, timestamp: api.timestamp });
        navInMarkets += await getStrategyNav(chainApi, strategies);
    }
    const depositsInMarkets = navInMarkets / NAV_TO_USDC;

    // totalDeposits − depositsInMarkets = srRoyUSDC value that is NOT already in the tranche sums.
    api.add(srRoyUsdc.asset, totalDeposits - depositsInMarkets);
};

// Measures the exact value the given `strategies` (srRoyUSDC's on-chain-resolved position-holders)
// hold inside Royco markets on `api.chain`, summed in NAV_UNIT (18-decimal, USDC-denominated) across
// all senior + junior tranches. This is the amount tvl()'s tranche sums already count for those
// holders; addSrRoyUsdc subtracts it, which is what prevents srRoyUSDC and the markets from
// double-counting the same deposits.
const getStrategyNav = async (api, strategies) => {
    const { seniorTranches, juniorTranches } = await getTranches(api);
    const tranches = [...seniorTranches, ...juniorTranches];
    if (!tranches.length) return 0n;

    // These are de-duplication calls: a failed call must fail the whole refresh (DefiLlama then
    // retries), never be silently skipped. Skipping would under-subtract the overlap and publish
    // inflated, double-counted TVL — so no permitFailure here.
    let nav = 0n;
    for (const strategy of strategies) {
        const shares = await api.multiCall({
            abi: 'erc20:balanceOf',
            calls: tranches.map(tranche => ({ target: tranche, params: [strategy] })),
        });

        // balanceOf returns shares; convert only the non-zero positions to their USDC value (nav).
        const claimsCalls = tranches
            .map((tranche, i) => ({ target: tranche, params: [shares[i]] }))
            .filter((_, i) => BigInt(shares[i]) > 0n);
        if (!claimsCalls.length) continue;

        const claims = await api.multiCall({ abi: convertToAssetsAbi, calls: claimsCalls });
        claims.forEach(claim => {
            nav += BigInt(claim.nav);
        });
    }
    return nav;
};

// Adds the RoyWstEth vault WITHOUT double-counting. `totalAssets()` is the wstETH NAV (already net
// of the strategies' Morpho debt) — Royco's own TVL. Its strategies also hold a srRoyUSDC position
// funded with USDC borrowed against that wstETH; srRoyUSDC (2) already counts that USDC, so we
// subtract it back out of (2) here so the leveraged leg is not counted twice within Royco.
const addRoyWstEth = async (api) => {
    const totalAssets = await api.call({ abi: 'uint256:totalAssets', target: royWstEth.address });
    api.add(royWstEth.asset, totalAssets);

    // Discover the vault's current position-holders on-chain (mainnet-only vault), then value the
    // srRoyUSDC shares they hold in USDC via srRoyUSDC.convertToAssets. No permitFailure: these are
    // de-duplication calls, so a failure must fail the refresh rather than skip the subtraction and
    // leave the borrowed leg double-counted.
    const strategies = await resolveStrategies(api, royWstEth.address);
    const shares = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: strategies.map(strategy => ({ target: srRoyUsdc.address, params: [strategy] })),
    });
    const assetCalls = strategies
        .map((_, i) => ({ target: srRoyUsdc.address, params: [shares[i]] }))
        .filter((_, i) => BigInt(shares[i]) > 0n);
    if (!assetCalls.length) return;

    const positions = await api.multiCall({ abi: srRoyUsdcConvertToAssetsAbi, calls: assetCalls });
    positions.forEach(usdc => {
        api.add(srRoyUsdc.asset, -BigInt(usdc)); // remove the already-counted srRoyUSDC leg
    });
};

module.exports = {
    start: '2026-01-27', // first TVL: srRoyUsdc vault's first deposit (block 24328493), predates the markets
    methodology: "Value is counted exactly once, with no double-counting. (1) Royco V2 market TVL is read from MarketDeployed events on each factory and summed as totalAssets() across senior and junior tranches on every chain - the single source of truth for value inside Royco markets. (2) The srRoyUSDC vault (mainnet) is a Royco-issued vault product whose deposits are Royco's own TVL - the same convention DefiLlama applies to curated-vault/aggregator products such as Yearn vaults, whose deposits count toward the issuing protocol even when forwarded to underlying venues. The vault allocates user USDC across Royco markets and other yield venues; the portion already sitting in Royco markets is measured on-chain - the vault's strategies are discovered via getStrategies() (each Makina cross-chain strategy resolved to its machine's hub caliber via getMakinaMachine().hubCaliber(), self-custody strategies used as-is) and their tranche positions read via balanceOf -> convertToAssets().nav across all chains - then subtracted, so that slice is never counted twice within Royco. (3) The RoyWstEth vault (mainnet) is a Royco-issued wstETH vault whose strategies supply the wstETH as Morpho collateral, borrow stablecoins, swap to USDC and deposit it into srRoyUSDC; its wstETH NAV is added, and the srRoyUSDC position its strategies hold (strategies discovered on-chain the same way; already counted in (2)) is subtracted back out so the borrowed leg is not double-counted.",
    ethereum: { tvl },
    avax: { tvl },
    arbitrum: { tvl },
    base: { tvl },
}
