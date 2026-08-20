const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getLogs2 } = require("../helper/cache/getLogs");

// TVL is counted once, at its lowest layer. Three sources, with subtractions where a higher layer
// deposits into a lower one (internal de-dup within Royco, not cross-protocol):
//   (1) Royco V2 markets (all chains): senior + junior tranche totalAssets().
//   (2) srRoyUSDC vault (mainnet): a Royco-issued USDC vault. Its full balance is Royco's own TVL
//       (Yearn-style: deposits count toward the issuing protocol even when forwarded elsewhere),
//       minus the slice its strategies already hold inside (1).
//   (3) RoyWstEth vault (mainnet): a Royco-issued wstETH vault. Its wstETH NAV is Royco TVL, minus
//       the srRoyUSDC position its strategies hold (already counted in (2)).

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

// Both return (stAssets, jtAssets, nav). stAssets/jtAssets are in the tranche's own deposit token;
// only `nav` is a USDC figure, in the protocol's 18-decimal NAV_UNIT.
const totalAssetsAbi = "function totalAssets() view returns ((uint256 stAssets, uint256 jtAssets, uint256 nav))";
const convertToAssetsAbi = "function convertToAssets(uint256 _shares) view returns ((uint256 stAssets, uint256 jtAssets, uint256 nav))";

const srRoyUsdc = {
    chain: "ethereum",
    address: "0xcd9f5907f92818bc06c9ad70217f089e190d2a32",
    asset: ADDRESSES.ethereum.USDC, // USDC
};

// A vault routes deposits through on-chain "strategy" contracts; whatever a strategy holds inside a
// lower Royco layer is the overlap to de-dup. Holders are resolved on-chain (never hardcoded) so the
// adapter self-updates: CROSSCHAIN strategies run through a Makina machine, so the holder is the
// machine's hub caliber (getMakinaMachine().hubCaliber()); ATOMIC/ASYNC strategies self-custody.
// enum StrategyType { ATOMIC, ASYNC, CROSSCHAIN }.
const STRATEGY_TYPE_CROSSCHAIN = 2;
const getStrategiesAbi = "function getStrategies() view returns (address[])";
const strategyTypeAbi = "function strategyType() view returns (uint8)";
const getMakinaMachineAbi = "function getMakinaMachine() view returns (address)";
const hubCaliberAbi = "function hubCaliber() view returns (address)";

const resolveStrategies = async (api, vault) => {
    const strategies = await api.call({ abi: getStrategiesAbi, target: vault });
    if (!strategies.length) return [];

    const types = await api.multiCall({ abi: strategyTypeAbi, calls: strategies });
    const crosschain = strategies.filter((_, i) => Number(types[i]) === STRATEGY_TYPE_CROSSCHAIN);
    const selfCustody = strategies.filter((_, i) => Number(types[i]) !== STRATEGY_TYPE_CROSSCHAIN);
    if (!crosschain.length) return selfCustody;

    const machines = await api.multiCall({ abi: getMakinaMachineAbi, calls: crosschain });
    const calibers = await api.multiCall({ abi: hubCaliberAbi, calls: machines });
    return [...selfCustody, ...calibers];
};

// NAV_UNIT (18 decimals, USDC-denominated) -> USDC (6 decimals)
const NAV_TO_USDC = 10n ** 12n;

const royWstEth = {
    chain: "ethereum",
    address: "0x41ce72e04d349eb957bdc373baa9c69207032c56",
    asset: ADDRESSES.ethereum.WSTETH, // wstETH
};

// srRoyUSDC is a standard ERC4626 (asset = USDC), so convertToAssets returns a plain USDC amount —
// unlike the tranches' convertToAssets, which returns the struct above.
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
    // (1) value held inside Royco markets, counted once from the tranches.
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

    // (2) and (3) live on mainnet only; each subtracts the part already counted above.
    if (api.chain === srRoyUsdc.chain) {
        await addSrRoyUsdc(api);
    }
    if (api.chain === royWstEth.chain) {
        await addRoyWstEth(api);
    }
};

// srRoyUSDC's full balance is Royco's own TVL, but totalAssets() already includes the USDC the vault
// placed into Royco markets — value the tranche sums above already count. Measure that in-market
// slice on-chain and subtract it, so the vault contributes only its not-yet-counted deposits.
const addSrRoyUsdc = async (api) => {
    const totalDeposits = BigInt(await api.call({ abi: 'uint256:totalAssets', target: srRoyUsdc.address }));

    // Resolve holders once, on mainnet; reuse across every market chain below.
    const strategies = await resolveStrategies(api, srRoyUsdc.address);

    let navInMarkets = 0n;
    for (const chain of Object.keys(config)) {
        const chainApi = chain === api.chain ? api : new sdk.ChainApi({ chain, timestamp: api.timestamp });
        navInMarkets += await getStrategyNav(chainApi, strategies);
    }
    const depositsInMarkets = navInMarkets / NAV_TO_USDC;

    api.add(srRoyUsdc.asset, totalDeposits - depositsInMarkets);
};

// Value the given strategies hold inside Royco markets on api.chain, summed in NAV_UNIT across all
// tranches. addSrRoyUsdc subtracts this to keep srRoyUSDC and the markets mutually exclusive.
const getStrategyNav = async (api, strategies) => {
    const { seniorTranches, juniorTranches } = await getTranches(api);
    const tranches = [...seniorTranches, ...juniorTranches];
    if (!tranches.length) return 0n;

    let nav = 0n;
    for (const strategy of strategies) {
        const shares = await api.multiCall({
            abi: 'erc20:balanceOf',
            calls: tranches.map(tranche => ({ target: tranche, params: [strategy] })),
        });

        // convert only the non-zero positions to their USDC value (nav).
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

// RoyWstEth's totalAssets() is its wstETH NAV (net of Morpho debt) — Royco's own TVL. Its strategies
// also park borrowed USDC in srRoyUSDC, which (2) already counts, so subtract that leg back out.
const addRoyWstEth = async (api) => {
    const totalAssets = await api.call({ abi: 'uint256:totalAssets', target: royWstEth.address });
    api.add(royWstEth.asset, totalAssets);

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
    start: '2026-01-27', // srRoyUSDC's first deposit (block 24328493), predates the markets
    methodology: "(1) Royco V2 market TVL: totalAssets() summed across senior and junior tranches (from MarketDeployed factory events) on every chain. (2) The srRoyUSDC vault (mainnet) allocates USDC across Royco markets and other venues; its balance is added minus the portion already sitting in Royco markets, so that slice is not counted twice. (3) The RoyWstEth vault (mainnet) adds its wstETH NAV minus the srRoyUSDC position it holds (already counted in (2)).",
    ethereum: { tvl },
    avax: { tvl },
    arbitrum: { tvl },
    base: { tvl },
}
