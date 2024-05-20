/*
 * Counterstake is a permissionless and fully decentralized cross-chain bridge.
 *
 * @see https://counterstake.org/
 */
const {
    fetchBaseAABalances,
    fetchOstableAssets,
    fetchOstableExchangeRatesInUSD,
    fetchOswapAssets,
    fetchOswapExchangeRates,
    summingBaseAABalancesToTvl,
} = require('../helper/chain/obyte');
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

async function bridgeTvl(timestamp, assetMetadata, exchangeRates) {
    const baseAABalances = await Promise.all([
        fetchBaseAABalances(timestamp, "DAN6VZNKNZBKJP7GYJST5FMONZOY4FNT"), // export
        fetchBaseAABalances(timestamp, "HNAFSLWSZDU2B2PLFIUNRZLGS4F2AUIL"), // import
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

async function pooledAssistantTvl(timestamp, assetMetadata, exchangeRates) {
    const baseAABalances = await Promise.all([
        fetchBaseAABalances(timestamp, "WKGC4O5UPW37XEGQKXPINIXFAXHTYHKL"), // export assitant
        fetchBaseAABalances(timestamp, "HLSRAK6LGDXLNGXUCB5Z43NCZMVLYTJU"), // import assistant
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

async function governanceTvl(timestamp, assetMetadata, exchangeRates) {
    const baseAABalances = await Promise.all([
        fetchBaseAABalances(timestamp, "HLNWXGGHGXWMZN27W2722MNJCHH2IVAO"), // export governance
        fetchBaseAABalances(timestamp, "KDHCTQOTKTO6MLYOCU6OCBI7KK72DV3P"), // import governance
        fetchBaseAABalances(timestamp, "VIKQXIULRJF7WATTAID2BB6YD6FRMZCF"), // pooled assistant governance
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

/**
 * Calculates TVL on the Obyte side of the cross-chain bridge. The calculated TVL contains:
 *  - the temporary stakes held in GBYTE for cross-chain transfers,
 *  - exported Obyte assets such as GBYTE or OUSD that are held in custody by the bridge
 *  - imported foreign chain assets (the Obyte version of those) held in pooled assistants as a buffer for faster transfers
 */
async function totalObyteTvl(timestamp) {
    // Fetch Ostable assets because it makes sense to export those Obyte assets to other chains
    // Fetch Oswap assets because pooled import assistants hold imported foreign assets to speed up user transfers form foreign chains
    const [ostableAssetMetadata, ostableExchangeRates, oswapAssetMetadata, oswapExchangeRates] = await Promise.all([
        fetchOstableAssets(),
        fetchOstableExchangeRatesInUSD(),
        fetchOswapAssets(),
        fetchOswapExchangeRates()
    ])

    const assetMetadata = { ...oswapAssetMetadata, ...ostableAssetMetadata }
    const exchangeRates = { ...oswapExchangeRates, ...ostableExchangeRates }

    const tvls = await Promise.all([
        bridgeTvl(timestamp, assetMetadata, exchangeRates),
        pooledAssistantTvl(timestamp, assetMetadata, exchangeRates),
        governanceTvl(timestamp, assetMetadata, exchangeRates)
    ]);

    return {
        tether: tvls.reduce((total, tvl) => total + tvl, 0)
    }
}

const totalTVLByEVMNetwork = async (api) => {
    const bridges = await getConfig('counterstake/bridges', 'https://counterstake.org/api/bridges').then((data) => data.data);
    const pooledAssistants = await getConfig('counterstake/poolStakes', 'https://counterstake.org/api/pooled_assistants').then((data) => data.data);

    const bridgeAasByChain = [];
    const tokensAndOwners = []

    bridges.forEach(({ home_network, foreign_network, export_aa, import_aa, stake_asset, home_asset }) => {
        if (home_network.toLowerCase() === api.chain) { // export
            tokensAndOwners.push([home_asset, export_aa])
            bridgeAasByChain.push(export_aa);
        } else if (foreign_network.toLowerCase() === api.chain) { // import
            tokensAndOwners.push([stake_asset, import_aa])
            bridgeAasByChain.push(import_aa);
        }
    });

    pooledAssistants.filter(({ network }) => network.toLowerCase() === api.chain).forEach(({ assistant_aa, side, bridge_id }) => {
        const bridge = bridges.find((bridge) => bridge.bridge_id === bridge_id);

        if (bridge) {
            if (side === 'import') {
                // stake asset
                tokensAndOwners.push([bridge.stake_asset, assistant_aa])
                // imported asset
                // tokensAndOwners.push([bridge.foreign_asset, assistant_aa])

            } else { // export 
                tokensAndOwners.push([bridge.home_asset, assistant_aa])
            }
        }

    });

    const governanceAddresses = await api.multiCall({
        abi: 'address:governance',
        calls: bridgeAasByChain,
    });

    const voteTokenAddresses = await api.multiCall({
        abi: 'address:votingTokenAddress',
        calls: governanceAddresses,
    });

    bridgeAasByChain.forEach((_, index) => {
        const voteTokenAddress = voteTokenAddresses[index];
        const governanceAddress = governanceAddresses[index];
        tokensAndOwners.push([voteTokenAddress, governanceAddress ])
    });

    const sum = await sumTokens2({ api, tokensAndOwners });

    return tryToGetUSDPriceOfUnknownTokens(sum, api);
};

const tryToGetUSDPriceOfUnknownTokens = async (sum, api) => {
    const LINE_CONTRACT = '0x31f8d38df6514b6cc3c360ace3a2efa7496214f6';
    const LINE_TOKEN_KEY = `kava:${LINE_CONTRACT}`;

    const transformedSumObject = { ...sum };

    if (LINE_TOKEN_KEY in sum) { // support LINE token on Kava Network

        const ORACLE_CONTRACT_ADDRESS = await api.call({
            abi: "address:oracle",
            target: LINE_CONTRACT,
        });

        const totalLocked = transformedSumObject[LINE_TOKEN_KEY]

        const linePriceInCollateral = await api.call({
            abi: "uint256:getPrice",
            target: ORACLE_CONTRACT_ADDRESS,
        });

        const priceInCollateral = totalLocked * linePriceInCollateral / 1e36
        const exchangeRates = await fetchOswapExchangeRates();

        transformedSumObject['usd'] = exchangeRates['GBYTE_USD'] * priceInCollateral;

        delete transformedSumObject[LINE_TOKEN_KEY];
    }

    return transformedSumObject;
}

module.exports = {
    timetravel: false,
        misrepresentedTokens: true,
    methodology:
        "The TVL is the USD value of the assets locked into the autonomous agents that extend the Counterstake protocol. " +
        "This includes the value of exported assets held in the custody of cross-chain bridges, the stakes of cross-chain transfers, " +
        "pooled assistant buffers and value stored for governance.",
    obyte: {
        tvl: totalObyteTvl
    },
    ethereum: {
        tvl: totalTVLByEVMNetwork
    },
    bsc: {
        tvl: totalTVLByEVMNetwork
    },
    polygon: {
        tvl: totalTVLByEVMNetwork
    },
    kava: {
        tvl: totalTVLByEVMNetwork
    }
}
