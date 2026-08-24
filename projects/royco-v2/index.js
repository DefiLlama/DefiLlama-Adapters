const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getLogs2 } = require("../helper/cache/getLogs");

// TVL is counted once, at its lowest layer. Five sources, with subtractions where a higher layer
// deposits into a lower one (internal de-dup within Royco, not cross-protocol):
//   (1) Royco V2 markets (all chains): senior + junior tranche totalAssets().
//   (2) Royco Day markets (all chains): the newer three-tranche generation, from its own factory.
//       Counted in the markets' own TOKENS, never in NAV — a Day market's NAV unit is whatever it
//       prices in (USD, BTC, ...). Senior + junior share one collateral ledger; the liquidity
//       provider tranche (LPT) holds the market's Balancer V3 BPT, of which only the quote leg is
//       new value (see unwrapDayBpt).
//   (3) Deposit requests queued at the EntryPoints (all chains, both generations): requestDeposit
//       escrows the tranche's own asset there, so it is in no tranche's totalAssets() until an
//       executor deposits it or the user cancels (see getEscrowedDeposits).
//   (4) srRoyUSDC vault (mainnet): a Royco-issued USDC vault. Its full balance is Royco's own TVL
//       (Yearn-style: deposits count toward the issuing protocol even when forwarded elsewhere),
//       minus the slice its strategies already hold inside (1) and (2).
//   (5) RoyWstEth vault (mainnet): a Royco-issued wstETH vault. Its wstETH NAV is Royco TVL, minus
//       the srRoyUSDC position its strategies hold (already counted in (4)).
//
// Market reads are FAIL-SOFT, because Royco Day deployment is permissionless: a market answers
// through deployer-chosen parts (arbitrary tokens, its own oracle) and can revert by neglect or on
// purpose. An unreadable market is dropped WHOLE — from its value and from the de-dup alike, so the
// two can never disagree — costing that market instead of the whole chain. De-dup calls stay hard: a
// skipped subtraction inflates TVL, whereas a dropped market only under-reports its own size.

// `v2` is the original two-tranche ("Dawn") factory, `day` the newer three-tranche one.
// Object.keys is the chain list the cross-chain de-dup sweeps.
const config = {
    "ethereum": {
        v2: { factoryAddress: "0x7cc6fb28ec7b5e7afc3cb3986141797ffc27253c", factoryFromBlock: 24650849 },
        day: { factoryAddress: "0xaaaaaaaaae46ca12bf3810df8c13c5e8a4400812", factoryFromBlock: 25759227 },
    },
    "avax": {
        v2: { factoryAddress: "0x7cc6fb28ec7b5e7afc3cb3986141797ffc27253c", factoryFromBlock: 80312789 },
        day: { factoryAddress: "0xaaaaaaaaae46ca12bf3810df8c13c5e8a4400812", factoryFromBlock: 93024169 },
    },
    "arbitrum": {
        v2: { factoryAddress: "0x7cc6fb28ec7b5e7afc3cb3986141797ffc27253c", factoryFromBlock: 441493793 },
        day: { factoryAddress: "0xaaaaaaaaae46ca12bf3810df8c13c5e8a4400812", factoryFromBlock: 494738482 },
    },
    "base": {
        v2: { factoryAddress: "0x568c9709daa2f7b7cc66abc3e41da0f0a339551a", factoryFromBlock: 48111449 },
        day: { factoryAddress: "0xaaaaaaaaae46ca12bf3810df8c13c5e8a4400812", factoryFromBlock: 49996440 },
    },
};

// The EntryPoints fronting the tranches. Arbitrum ran a first Dawn one before the current one; it is
// still queried because a request left open there is still live user capital.
const entryPoints = {
    "ethereum": { dawn: ["0x63da1229be88fb4d20210147954a1a3e05f2581b"], day: ["0xaf55a0c251690d9322b5f94b7e50ee895750262c"] },
    "avax": { dawn: ["0x63da1229be88fb4d20210147954a1a3e05f2581b"], day: ["0xaf55a0c251690d9322b5f94b7e50ee895750262c"] },
    "arbitrum": { dawn: ["0xe72b67389e6c8919961b4eb2b9563b9359ba30b6", "0x63da1229be88fb4d20210147954a1a3e05f2581b"], day: ["0xaf55a0c251690d9322b5f94b7e50ee895750262c"] },
    "base": { dawn: ["0x63da1229be88fb4d20210147954a1a3e05f2581b"], day: ["0xaf55a0c251690d9322b5f94b7e50ee895750262c"] },
};

const marketDeployedEventAbi = "event MarketDeployed((address seniorTranche, address juniorTranche, address kernel, address accountant) roycoMarket, (string seniorTrancheName, string seniorTrancheSymbol, string juniorTrancheName, string juniorTrancheSymbol, address seniorTrancheImplementation, address juniorTrancheImplementation, address kernelImplementation, address accountantImplementation, bytes seniorTrancheInitializationData, bytes juniorTrancheInitializationData, bytes kernelInitializationData, bytes accountantInitializationData, bytes32 seniorTrancheProxyDeploymentSalt, bytes32 juniorTrancheProxyDeploymentSalt, bytes32 kernelProxyDeploymentSalt, bytes32 accountantProxyDeploymentSalt, (address target, bytes4[] selectors, uint64[] roles)[] roles) params)";

// Both return (stAssets, jtAssets, nav). stAssets/jtAssets are in the tranche's own deposit token;
// only `nav` is a USDC figure, in the protocol's 18-decimal NAV_UNIT.
const totalAssetsAbi = "function totalAssets() view returns ((uint256 stAssets, uint256 jtAssets, uint256 nav))";
const convertToAssetsAbi = "function convertToAssets(uint256 _shares) view returns ((uint256 stAssets, uint256 jtAssets, uint256 nav))";

const dayMarketDeployedEventAbi = "event MarketDeploymentCompleted(address indexed template, address indexed deployer, (address seniorTranche, address juniorTranche, address liquidityProviderTranche, address kernel, address accountant, address ydm, address lptYdm, bytes extras) result)";

// Every Day tranche returns the same AssetClaims, but only its own field is populated:
// `collateralAssets` for senior/junior (collateral token units), `lptAssets` for the LPT (BPT) plus
// `stShares`, its idle liquidity-premium senior shares. `nav` is in the market's NAV unit, which is
// NOT necessarily USD, so it is never used here.
const dayTotalAssetsAbi = "function totalAssets() view returns ((uint256 collateralAssets, uint256 lptAssets, uint256 stShares, uint256 nav) claims)";
const dayConvertToAssetsAbi = "function convertToAssets(uint256 _shares) view returns ((uint256 collateralAssets, uint256 lptAssets, uint256 stShares, uint256 nav) claims)";

// Balancer V3 holds every pool's balances in its singleton vault. `balancesRaw` is in each token's
// own decimals, which is what api.add wants.
const getPoolTokenInfoAbi = "function getPoolTokenInfo(address pool) view returns (address[] tokens, (uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenInfo, uint256[] balancesRaw, uint256[] lastBalancesLiveScaled18)";

const srRoyUsdc = {
    chain: "ethereum",
    address: "0xcd9f5907f92818bc06c9ad70217f089e190d2a32",
    asset: ADDRESSES.ethereum.USDC, // USDC
};

const royWstEth = {
    chain: "ethereum",
    address: "0x41ce72e04d349eb957bdc373baa9c69207032c56",
    asset: ADDRESSES.ethereum.WSTETH, // wstETH
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

// srRoyUSDC is a standard ERC4626 (asset = USDC), so convertToAssets returns a plain USDC amount —
// unlike the tranches' convertToAssets, which returns the struct above.
const srRoyUsdcConvertToAssetsAbi = "function convertToAssets(uint256 shares) view returns (uint256 assets)";

// Royco's own vault share tokens, by the chain they live on. Built by reduction, not as a literal
// keyed by vault.chain: both live on mainnet, so a literal would drop one to a duplicate key.
const roycoVaultTokens = [srRoyUsdc, royWstEth].reduce((byChain, vault) => {
    if (!byChain[vault.chain]) byChain[vault.chain] = new Set();
    byChain[vault.chain].add(vault.address.toLowerCase());
    return byChain;
}, {});

// Books one token leg of a market — a tranche's claim, or an entry point's escrowed deposit — unless
// it is denominated in one of Royco's OWN tokens, whose backing is already counted a layer down.
// A market can be built on one: a mainnet Day market's collateral asset IS srRoyUSDC, and since Day
// deployment is permissionless and only constrains collateralAsset to "a contract, != quoteAsset",
// one can equally be built on another market's tranche share — which is not harmless, because every
// Day market seeds a pool of (senior share, quote asset) and that is exactly what gets senior shares
// priced. Skipping keeps such value counted once, at its lowest layer. Every add AND every de-dup
// subtract routes through here, so a leg never added is never subtracted either.
const addMarketAsset = (api, roycoTokens, token, amount) => {
    if (roycoTokens.has(token.toLowerCase())) return;
    api.add(token, amount);
};

// Royco's own tokens on this chain: the vault share tokens, plus every tranche share of both
// generations, taken from the market lists tvl() already resolved.
const getRoycoTokens = (api, dawnMarkets, dayMarkets) => new Set([
    ...(roycoVaultTokens[api.chain] ?? []),
    ...dawnMarkets.flatMap(market => [market.seniorTranche, market.juniorTranche]),
    ...dayMarkets.flatMap(market => [market.seniorTranche, market.juniorTranche, market.liquidityProviderTranche]),
].map(token => token.toLowerCase()));

const isReadable = (...reads) => reads.every(read => read !== null && read !== undefined);

// permitFailure survives a market that REVERTS, but not one that never returns. A Day market's oracle
// is deployer-supplied code called with all remaining gas (previewSyncTrancheAccountingFor ->
// previewPoke), on the exact path totalAssets() takes, so it can burn the whole eth_call allowance and
// fail the BATCHED call rather than the one entry inside it — public RPCs answer "out of gas" or
// "execution aborted (timeout)". The sdk then returns undefined for that batch and throws on it, so a
// soft read would die exactly like a hard one and take the chain with it. Re-reading one call at a
// time puts the failure back where it belongs: the market that caused it reads null and is dropped,
// every other market still answers. Ordinary whole-batch RPC hiccups land here too.
const softMultiCall = async (api, { abi, calls }) => {
    try {
        return await api.multiCall({ abi, calls, permitFailure: true });
    } catch (e) {
        sdk.log(`royco-v2: batched read failed as a whole on ${api.chain}, retrying call by call`);
        return Promise.all(calls.map(call => {
            const { target, params } = typeof call === 'string' ? { target: call } : call;
            return api.call({ abi, target, params, permitFailure: true });
        }));
    }
};

// A dropped market is missing TVL, not an adapter bug — worth seeing, never worth failing a refresh.
const logSkipped = (api, generation, skipped, total) => {
    if (skipped) sdk.log(`royco-v2: skipping ${skipped}/${total} unreadable Royco ${generation} market(s) on ${api.chain}`);
};

// Total escrowed in the `generation` entry points on this chain, per token: deposits requested but not
// yet executed. Neither entry point exposes an aggregate — requests live in per-(user, nonce) mappings
// — but requestDeposit is the only path that moves a market ASSET in, and execute/cancel move the
// exact amount back out, so at rest balanceOf IS the outstanding total.
//
// `trancheShares` are excluded, and that is load-bearing: the same contract escrows redemption
// requests as SHARES and accrues protocol fees as shares (on arbitrum it holds 99.8% of one junior
// tranche's supply). A share is already backed by its tranche's totalAssets() in (1)/(2).
//
// permitFailure because a permissionless market can be built on any token, including one whose
// balanceOf reverts. Safe to read soft precisely because escrow is purely additive — nothing nets it
// back out — so a token that will not answer costs its own queued deposits and nothing else.
const getEscrowedDeposits = async (api, generation, tokens, trancheShares) => {
    const escrows = entryPoints[api.chain]?.[generation] ?? [];
    const shares = new Set(trancheShares.map(tranche => tranche.toLowerCase()));
    // De-duplicated first: markets share assets (three mainnet Dawn markets are built on
    // AA_FalconXUSDC), and one entry point balance must be booked once, not once per market.
    const assets = [...new Set(tokens.map(token => token.toLowerCase()))].filter(token => !shares.has(token));

    const escrowed = new Map(assets.map(asset => [asset, 0n]));
    if (!escrows.length || !assets.length) return escrowed;

    const balances = await softMultiCall(api, {
        abi: 'erc20:balanceOf',
        calls: escrows.flatMap(escrow => assets.map(asset => ({ target: asset, params: [escrow] }))),
    });
    balances.forEach((balance, i) => {
        const asset = assets[i % assets.length];
        if (isReadable(balance)) escrowed.set(asset, escrowed.get(asset) + BigInt(balance));
    });
    return escrowed;
};

// Every Royco V2 market on api.chain that still answers, resolved to what tvl() needs. totalAssets()
// runs through the kernel's oracle and pause flag, so a market can simply stop answering — four
// mainnet sNUSD tranches revert today, and when these reads were hard they took the whole ethereum
// chain down with them. Senior and junior share one kernel and fail together, so requiring both keeps
// a market from ever being counted by halves.
const getTranches = async (api) => {
    const { factoryAddress, factoryFromBlock } = config[api.chain].v2;
    const marketDeployedLogs = await getLogs2({
        api,
        target: factoryAddress,
        eventAbi: marketDeployedEventAbi,
        fromBlock: factoryFromBlock,
    });
    const deployed = marketDeployedLogs.map(log => log.roycoMarket);
    if (!deployed.length) return [];

    const senior = deployed.map(market => market.seniorTranche);
    const junior = deployed.map(market => market.juniorTranche);
    const seniorAssets = await softMultiCall(api, { abi: 'address:asset', calls: senior });
    const juniorAssets = await softMultiCall(api, { abi: 'address:asset', calls: junior });
    const seniorClaims = await softMultiCall(api, { abi: totalAssetsAbi, calls: senior });
    const juniorClaims = await softMultiCall(api, { abi: totalAssetsAbi, calls: junior });

    const markets = deployed
        .map((market, i) => ({
            seniorTranche: market.seniorTranche,
            juniorTranche: market.juniorTranche,
            seniorAsset: seniorAssets[i],
            juniorAsset: juniorAssets[i],
            seniorClaims: seniorClaims[i],
            juniorClaims: juniorClaims[i],
        }))
        .filter(market => isReadable(market.seniorAsset, market.juniorAsset, market.seniorClaims, market.juniorClaims));

    logSkipped(api, 'V2', deployed.length - markets.length, deployed.length);
    return markets;
};

// Every Royco Day market on api.chain that still answers, fully resolved: its tranches, the tokens it
// is made of, its claims, and the Balancer pool behind its LPT. Discovered from factory events, so new
// markets need no adapter change.
//
// Deployment is PERMISSIONLESS and a market answers through deployer-chosen parts, so every read is
// soft and a failing market is dropped whole — otherwise one market would zero the chain's TVL, a
// griefing vector anybody could buy for the price of a deployment. Resolving here also makes
// unwrapDayBpt pure, so the decomposition cannot fail halfway.
//
// Not at risk from a hostile deployer: every figure booked is a TOKEN BALANCE, so a rigged oracle
// cancels out (the ledger is converted to NAV and back by the same price) and a made-up token is
// simply unpriced. Only availability is attackable, which is what the soft reads defend.
const getDayMarkets = async (api) => {
    const { factoryAddress, factoryFromBlock } = config[api.chain].day;
    const marketDeployedLogs = await getLogs2({
        api,
        target: factoryAddress,
        eventAbi: dayMarketDeployedEventAbi,
        fromBlock: factoryFromBlock,
    });
    const deployed = marketDeployedLogs.map(log => log.result);
    if (!deployed.length) return [];

    const kernels = deployed.map(market => market.kernel);
    const collateralAssets = await softMultiCall(api, { abi: 'address:collateralAsset', calls: kernels });
    const quoteAssets = await softMultiCall(api, { abi: 'address:quoteAsset', calls: kernels });
    const lptAssets = await softMultiCall(api, { abi: 'address:lptAsset', calls: kernels });
    const stClaims = await softMultiCall(api, { abi: dayTotalAssetsAbi, calls: deployed.map(market => market.seniorTranche) });
    const jtClaims = await softMultiCall(api, { abi: dayTotalAssetsAbi, calls: deployed.map(market => market.juniorTranche) });
    const lptClaims = await softMultiCall(api, { abi: dayTotalAssetsAbi, calls: deployed.map(market => market.liquidityProviderTranche) });

    // Named fields are copied one by one, never spread: a decoded log is an ethers `Result` whose
    // named fields live on a proxy that `{ ...result }` drops, leaving an all-undefined market.
    const resolved = deployed
        .map((market, i) => ({
            seniorTranche: market.seniorTranche,
            juniorTranche: market.juniorTranche,
            liquidityProviderTranche: market.liquidityProviderTranche,
            kernel: market.kernel,
            collateralAsset: collateralAssets[i],
            quoteAsset: quoteAssets[i],
            pool: lptAssets[i],
            stClaims: stClaims[i],
            jtClaims: jtClaims[i],
            lptClaims: lptClaims[i],
        }))
        .filter(market => isReadable(market.collateralAsset, market.quoteAsset, market.pool, market.stClaims, market.jtClaims, market.lptClaims));

    // In Balancer V3 the pool contract IS its BPT, so one address is both the token whose supply we
    // divide by and the `pool` argument its vault expects.
    const vaults = resolved.length ? await softMultiCall(api, { abi: 'address:getVault', calls: resolved.map(market => market.pool) }) : [];
    const pooled = resolved.map((market, i) => ({ ...market, vault: vaults[i] })).filter(market => isReadable(market.vault));

    const bptSupplies = pooled.length ? await softMultiCall(api, { abi: 'uint256:totalSupply', calls: pooled.map(market => market.pool) }) : [];
    const poolInfos = pooled.length
        ? await softMultiCall(api, { abi: getPoolTokenInfoAbi, calls: pooled.map(market => ({ target: market.vault, params: [market.pool] })) })
        : [];

    const markets = pooled
        .map((market, i) => ({
            ...market,
            bptTotalSupply: bptSupplies[i],
            poolTokens: poolInfos[i] && poolInfos[i].tokens,
            poolBalances: poolInfos[i] && poolInfos[i].balancesRaw,
        }))
        // The pool must really be this market's (senior tranche share, quote asset) pair — the venue
        // enforces it at initialization, but a future template need not, and decomposing anything else
        // would attribute an unrelated token's balance here. Confirming it also lets unwrapDayBpt
        // index safely.
        .filter(market => isReadable(market.bptTotalSupply, market.poolTokens, market.poolBalances)
            && [market.quoteAsset, market.seniorTranche].every(token => market.poolTokens.some(poolToken => poolToken.toLowerCase() === token.toLowerCase())));

    logSkipped(api, 'Day', deployed.length - markets.length, deployed.length);
    return markets;
};

const tvl = async (api) => {
    // Both lists are resolved ONCE, up front, and handed to every path that reads them: the adds, the
    // de-dup subtractions, and the Royco-token set. Re-deriving a list would let a market be added by
    // one call and not subtracted by the other — these reads are on-chain now, so two calls can
    // legitimately disagree at two block heights, and that disagreement inflates TVL.
    const dawnMarkets = await getTranches(api);
    const dayMarkets = await getDayMarkets(api);
    const roycoTokens = getRoycoTokens(api, dawnMarkets, dayMarkets);

    // (1) value held inside Royco V2 markets, counted once from the tranches.
    dawnMarkets.forEach(market => {
        addMarketAsset(api, roycoTokens, market.seniorAsset, BigInt(market.seniorClaims.stAssets));
        addMarketAsset(api, roycoTokens, market.juniorAsset, BigInt(market.juniorClaims.jtAssets));
    });

    // (3), Dawn half. The tranches are the exclusion set: the same contract escrows redemption
    // requests as shares, already backed by the totalAssets() just counted.
    const dawnEscrow = await getEscrowedDeposits(
        api,
        'dawn',
        dawnMarkets.flatMap(market => [market.seniorAsset, market.juniorAsset]),
        dawnMarkets.flatMap(market => [market.seniorTranche, market.juniorTranche]),
    );
    dawnEscrow.forEach((assets, asset) => addMarketAsset(api, roycoTokens, asset, assets));

    // (2), plus (3)'s Day half.
    await addDayMarkets(api, dayMarkets, roycoTokens);
    await subtractDayStrategyOverlap(api, dayMarkets, roycoTokens);

    // (4) and (5) live on mainnet only; each subtracts the part already counted above.
    if (api.chain === srRoyUsdc.chain) {
        await addSrRoyUsdc(api, dawnMarkets);
    }
    if (api.chain === royWstEth.chain) {
        await addRoyWstEth(api);
    }
};

// Day markets in their own tokens, never in NAV. Two legs: the COLLATERAL asset shared by senior and
// junior — each tranche's claim on one ledger, so summing both is the ledger, not a double count —
// and the pool QUOTE asset behind the LPT. Both legs also pick up whatever the Day entry point still
// escrows in those tokens.
const addDayMarkets = async (api, markets, roycoTokens) => {
    if (!markets.length) return;

    const tranches = markets.flatMap(market => [market.seniorTranche, market.juniorTranche, market.liquidityProviderTranche]);

    markets.forEach(market => {
        addMarketAsset(api, roycoTokens, market.collateralAsset, BigInt(market.stClaims.collateralAssets));
        addMarketAsset(api, roycoTokens, market.collateralAsset, BigInt(market.jtClaims.collateralAssets));
    });

    const collateralEscrow = await getEscrowedDeposits(api, 'day', markets.map(market => market.collateralAsset), tranches);
    collateralEscrow.forEach((assets, asset) => addMarketAsset(api, roycoTokens, asset, assets));

    // The LPT's deposit asset is the market's BPT, and an LPT deposit request escrows BPT too, so the
    // two are summed and decomposed together; a pool is created per market, so no escrow balance is
    // claimed twice. (`stShares`, the idle liquidity-premium shares, is ignored: those are senior
    // shares, already inside the senior claim above.)
    const bptEscrow = await getEscrowedDeposits(api, 'day', markets.map(market => market.pool), tranches);
    const legs = unwrapDayBpt(markets, markets.map(market => BigInt(market.lptClaims.lptAssets) + bptEscrow.get(market.pool.toLowerCase())));

    // ONLY the quote leg. The pool's other leg is senior tranche shares, and the collateral claims
    // above already back every senior share in existence, wherever it sits — user wallets, the pool,
    // the LPT's idle premium pile. Booking it here would count it twice.
    legs.forEach(leg => addMarketAsset(api, roycoTokens, leg.quoteAsset, leg.quoteAssets));
};

// Unwraps a BPT amount per market into the two legs of its Balancer pool, (senior tranche share, quote
// asset). A proportional unwrap is what the BPT can be redeemed for, so a holding of `bpt` out of
// `bptTotalSupply` is worth poolLegBalance * bpt / bptTotalSupply of each leg — which correctly
// ignores BPT held by anyone else (third parties LP into the same pool, and the entry point escrows
// some as queued deposits). Signed: a positive amount books a holding, a negative one cancels a
// de-duplicated position.
//
// Pure — every pool figure was read and verified in getDayMarkets. This only DECOMPOSES; which legs to
// book is not symmetric between the callers, so that is left to them.
const unwrapDayBpt = (markets, bptAmounts) => markets
    .map((market, index) => ({ market, index, bpt: bptAmounts[index] }))
    .filter(position => position.bpt !== 0n && BigInt(position.market.bptTotalSupply) > 0n)
    .map(({ market, index, bpt }) => {
        // Legs are located by MATCHING THEIR ADDRESS, never as "the other one": that inversion yields
        // an index for any two-token pool. getDayMarkets already dropped any market whose pool is
        // missing either leg, so this always resolves.
        const leg = (token) => {
            const at = market.poolTokens.findIndex(poolToken => poolToken.toLowerCase() === token.toLowerCase());
            return BigInt(market.poolBalances[at]) * bpt / BigInt(market.bptTotalSupply);
        };
        return {
            index,
            quoteAsset: market.quoteAsset,
            quoteAssets: leg(market.quoteAsset),
            seniorTranche: market.seniorTranche,
            seniorShares: leg(market.seniorTranche),
        };
    });

// srRoyUSDC's full balance is Royco's own TVL, but totalAssets() already includes the USDC the vault
// placed into Royco markets — value the tranche sums above already count. Measure that in-market slice
// on-chain and subtract it, so the vault contributes only its not-yet-counted deposits.
const addSrRoyUsdc = async (api, dawnMarkets) => {
    const totalDeposits = BigInt(await api.call({ abi: 'uint256:totalAssets', target: srRoyUsdc.address }));

    // Resolve holders once, on mainnet; reuse across every market chain below.
    const strategies = await resolveStrategies(api, srRoyUsdc.address);

    let navInMarkets = 0n;
    for (const chain of Object.keys(config)) {
        const chainApi = chain === api.chain ? api : new sdk.ChainApi({ chain, timestamp: api.timestamp });
        navInMarkets += await getStrategyNav(chainApi, strategies, chain === api.chain ? dawnMarkets : undefined);
    }
    const depositsInMarkets = navInMarkets / NAV_TO_USDC;

    // The same strategies' Royco DAY positions are the other half of this overlap. They cannot be
    // folded in here — a Day claim is a token amount on the market's own chain, not a USDC figure — so
    // subtractDayStrategyOverlap cancels them during that chain's own run.
    api.add(srRoyUsdc.asset, totalDeposits - depositsInMarkets);
};

// Value the given strategies hold inside Royco V2 markets on api.chain, summed in NAV_UNIT across all
// tranches. addSrRoyUsdc subtracts this to keep srRoyUSDC and the markets mutually exclusive. On the
// vault's own chain tvl() passes in the very list it added from, so the two cannot disagree; other
// chains re-read, since their add side runs in a separate adapter invocation. Either way a market
// dropped on the add side is dropped here too — its value was never added, so a position inside it
// must not be subtracted, and the vault reports that position once on its own books.
const getStrategyNav = async (api, strategies, dawnMarkets) => {
    // `??`, not `||`: an empty list must be used as-is, and then nothing was added either.
    const markets = dawnMarkets ?? await getTranches(api);
    const tranches = markets.flatMap(market => [market.seniorTranche, market.juniorTranche]);
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

// Cancels the overlap between srRoyUSDC (4) and this chain's Day markets (2). It lives here rather
// than in addSrRoyUsdc because of WHERE the correction lands: the V2 overlap nets out as one USDC
// figure against the vault's mainnet balance, but a Day claim is a token amount on the market's own
// chain, so it has to be applied during that chain's run. The vault is mainnet-only, so its strategies
// are resolved through a mainnet api whichever chain this runs for.
const subtractDayStrategyOverlap = async (api, markets, roycoTokens) => {
    if (!markets.length) return;

    const vaultApi = api.chain === srRoyUsdc.chain ? api : new sdk.ChainApi({ chain: srRoyUsdc.chain, timestamp: api.timestamp });
    const strategies = await resolveStrategies(vaultApi, srRoyUsdc.address);
    await subtractDayStrategyPositions(api, markets, strategies, roycoTokens);
};

// Removes what `strategies` hold inside Day markets on api.chain from the totals addDayMarkets added,
// in the markets' OWN tokens: a Day market prices in whatever unit it was configured with, so `nav` is
// not convertible to USDC, but a token claim nets exactly against the token amounts added.
// Dedup-critical, so no permitFailure: a skipped subtraction publishes inflated TVL. That ordering is
// deliberate — never inflate beats always publish — and it leaves one narrow hard path: a hostile
// market that reads fine during discovery but not here, with its shares gifted to a resolved strategy
// address, would fail the chain rather than under-subtract. It fails safe (stale, never wrong), and no
// strategy holds any Day tranche today.
const subtractDayStrategyPositions = async (api, markets, strategies, roycoTokens) => {
    if (!markets.length || !strategies.length) return;

    const collateralAssets = markets.map(market => market.collateralAsset);

    // Senior and junior claim the collateral asset, the LPT claims BPT. One flat list so a holder's
    // whole footprint is two multiCalls, with entry i belonging to market (i % markets.length).
    const collateralTranches = [...markets.map(market => market.seniorTranche), ...markets.map(market => market.juniorTranche)];
    const tranches = [...collateralTranches, ...markets.map(market => market.liquidityProviderTranche)];

    const strategyBpt = markets.map(() => 0n);
    for (const strategy of strategies) {
        const shares = await api.multiCall({
            abi: 'erc20:balanceOf',
            calls: tranches.map(tranche => ({ target: tranche, params: [strategy] })),
        });

        const positions = tranches
            .map((tranche, i) => ({ tranche, i, shares: BigInt(shares[i]) }))
            .filter(position => position.shares > 0n);
        if (!positions.length) continue;

        const claims = await api.multiCall({
            abi: dayConvertToAssetsAbi,
            calls: positions.map(position => ({ target: position.tranche, params: [position.shares] })),
        });

        claims.forEach((claim, k) => {
            const { i } = positions[k];
            const market = i % markets.length;
            if (i < collateralTranches.length) {
                addMarketAsset(api, roycoTokens, collateralAssets[market], -BigInt(claim.collateralAssets));
            } else {
                // Settled below, once every holder's BPT is accumulated. (`claim.stShares` is
                // untouched: the LPT's convertToAssets zeroes it, so idle premium shares were never
                // attributed to this strategy.)
                strategyBpt[market] -= BigInt(claim.lptAssets);
            }
        });
    }

    // An LPT position's BPT claims BOTH pool legs, and BOTH were added, in different places: the quote
    // leg by addDayMarkets, the senior leg by the collateral claims above (a senior share sitting in
    // the pool is still backed by the ledger). balanceOf found no senior shares for this strategy
    // because the POOL holds them, so this is the only place that leg can be netted out.
    const legs = unwrapDayBpt(markets, strategyBpt);
    legs.forEach(leg => addMarketAsset(api, roycoTokens, leg.quoteAsset, leg.quoteAssets));
    if (!legs.length) return;

    // What was added for the senior leg is those shares' claim on the collateral ledger, so convert
    // before subtracting. convertToAssets takes an unsigned share count, hence magnitude-then-resign.
    const seniorClaims = await api.multiCall({
        abi: dayConvertToAssetsAbi,
        calls: legs.map(leg => ({ target: leg.seniorTranche, params: [(leg.seniorShares < 0n ? -leg.seniorShares : leg.seniorShares).toString()] })),
    });
    seniorClaims.forEach((claim, i) => {
        const collateralAssetsOwed = BigInt(claim.collateralAssets);
        addMarketAsset(api, roycoTokens, collateralAssets[legs[i].index], legs[i].seniorShares < 0n ? -collateralAssetsOwed : collateralAssetsOwed);
    });
};

// RoyWstEth's totalAssets() is its wstETH NAV (net of Morpho debt) — Royco's own TVL. Its strategies
// also park borrowed USDC in srRoyUSDC, which (4) already counts, so subtract that leg back out.
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
    methodology: "(1) Royco V2 market TVL: totalAssets() summed across senior and junior tranches (from MarketDeployed factory events) on every chain. (2) Royco Day markets, the newer three-tranche generation (from MarketDeploymentCompleted events on its own factory), counted in the markets' own tokens rather than in NAV because a Day market's NAV unit is whatever it prices in (USD, BTC, ...): senior and junior share one collateral ledger, so each tranche's totalAssets().collateralAssets is added against the kernel's collateralAsset; the liquidity provider tranche takes deposits in the market's Balancer V3 BPT, whose pool is (senior tranche share, quote asset), and since the senior tranche's claim already covers every senior share in existence only the quote leg is added, sized by a proportional unwrap (poolQuoteBalance * bptOwned / bptTotalSupply). (3) Deposit requests still queued at the Royco EntryPoints are added on every chain for both generations: requestDeposit escrows the tranche's own asset there, outside every tranche's totalAssets(), until an executor deposits it or the user cancels, so the entry point's balance of each market asset is the outstanding request total; only market assets are swept, never tranche share tokens, since redemption requests and accrued protocol fees sit in the same contract as shares that (1) and (2) already back. (4) The srRoyUSDC vault (mainnet) allocates USDC across Royco markets and other venues; its balance is added minus the portion already sitting in Royco markets, so that slice is not counted twice - as nav for V2 markets, and in the markets' own tokens on their own chain for Day markets. (5) The RoyWstEth vault (mainnet) adds its wstETH NAV minus the srRoyUSDC position it holds (already counted in (4)). A market or entry-point leg denominated in one of Royco's own vault tokens is skipped, because the vault below already reports that backing in full. Market reads are fail-soft: Royco Day deployment is permissionless, so an unreadable market is dropped from both its value and the de-duplication rather than failing the whole chain.",
    ethereum: { tvl },
    avax: { tvl },
    arbitrum: { tvl },
    base: { tvl },
}
