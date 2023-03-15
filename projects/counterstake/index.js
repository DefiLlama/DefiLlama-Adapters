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
const utils = require('../helper/utils');
const sdk = require('@defillama/sdk')

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

const toUpperCaseFirstLetter = (str) => {
    if (!str) return "";

    const firstLetterCap = str.charAt(0).toUpperCase();
    const remainingLetters = str.slice(1);

    return firstLetterCap + remainingLetters;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const totalTVLByEVMNetwork = async (_, _1, _2, { api }) => {
    const bridges = await utils.fetchURL('https://counterstake.org/api/bridges').then((data) => data.data.data);
    const pooledAssistants = await utils.fetchURL('https://counterstake.org/api/pooled_assistants').then((data) => data.data.data);

    const chain = toUpperCaseFirstLetter(api.chain === 'bsc' ? "BSC" : api.chain);

    const erc20Contracts = [];
    const nativeContracts = [];
    const bridgeAasByChain = [];

    bridges.forEach(({ home_network, foreign_network, export_aa, import_aa, stake_asset, home_asset }) => {
        if (home_network === chain) { // export
            if (home_asset !== ZERO_ADDRESS) {
                erc20Contracts.push({ bridgeContract: export_aa, tokenContract: home_asset });
            } else {
                nativeContracts.push({ bridgeContract: export_aa, tokenContract: home_asset });
            }
            bridgeAasByChain.push(export_aa);
        } else if (foreign_network === chain) { // import
            if (stake_asset !== ZERO_ADDRESS) {
                erc20Contracts.push({ bridgeContract: import_aa, tokenContract: stake_asset });
            } else {
                nativeContracts.push({ bridgeContract: import_aa, tokenContract: stake_asset });
            }
            bridgeAasByChain.push(import_aa);
        }
    });

    pooledAssistants.filter(({ network }) => network === chain).forEach(({ assistant_aa, side, bridge_id }) => {
        const bridge = bridges.find((bridge) => bridge.bridge_id === bridge_id);

        if (bridge) {
            if (side === 'import') {
                // stake asset
                if (bridge.stake_asset !== ZERO_ADDRESS) {
                    erc20Contracts.push({ bridgeContract: assistant_aa, tokenContract: bridge.stake_asset });
                } else {
                    nativeContracts.push({ bridgeContract: assistant_aa, tokenContract: bridge.stake_asset });
                }

                // imported asset
                if (bridge.foreign_asset !== ZERO_ADDRESS) {
                    erc20Contracts.push({ bridgeContract: assistant_aa, tokenContract: bridge.foreign_asset });
                } else {
                    nativeContracts.push({ bridgeContract: assistant_aa, tokenContract: bridge.foreign_asset });
                }

            } else { // export 
                if (bridge.home_asset !== ZERO_ADDRESS) {
                    erc20Contracts.push({ bridgeContract: assistant_aa, tokenContract: bridge.home_asset });
                } else {
                    nativeContracts.push({ bridgeContract: assistant_aa, tokenContract: bridge.home_asset });
                }
            }
        }

    });

    const governanceAddresses = await api.multiCall({
        abi: 'address:governance',
        calls: bridgeAasByChain.map((address) => ({ target: address })),
    });

    const voteTokenAddresses = await api.multiCall({
        abi: 'address:votingTokenAddress',
        calls: governanceAddresses,
    });

    bridgeAasByChain.forEach((_, index) => {
        const voteTokenAddress = voteTokenAddresses[index];
        const governanceAddress = governanceAddresses[index];

        if (voteTokenAddress === ZERO_ADDRESS) {
            nativeContracts.push({ bridgeContract: governanceAddress, tokenContract: voteTokenAddress });
        } else {
            erc20Contracts.push({ bridgeContract: governanceAddress, tokenContract: voteTokenAddress });
        }
    });

    const erc20Balance = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: erc20Contracts.map(({ bridgeContract, tokenContract }) => ({
            target: tokenContract,
            params: [bridgeContract],
        }))
    }).then((data) => {
        const balanceByToken = {};

        data.forEach((balance, index) => {
            const { tokenContract } = erc20Contracts[index];
            const tokenContractWithNetwork = `${api.chain}:${tokenContract}`;

            if (tokenContractWithNetwork in balanceByToken) {
                balanceByToken[tokenContractWithNetwork] += +balance;
            } else {
                balanceByToken[tokenContractWithNetwork] = +balance;
            }
        });

        return balanceByToken;
    });

    const res = await sdk.api.eth.getBalances({ targets: nativeContracts.map(({ bridgeContract }) => bridgeContract), chain: api.chain, });
    const native = res.output.reduce((a, i) => (a + +i.balance), 0);

    return { [`${api.chain}:${ZERO_ADDRESS}`]: native, ...erc20Balance };
}

module.exports = {
    timetravel: false,
    doublecounted: false,
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
