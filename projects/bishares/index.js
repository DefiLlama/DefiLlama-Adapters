const { request } = require("graphql-request");
const BigNumber = require('bignumber.js');
const sdk = require("@defillama/sdk");
const GET_RESERVES_ABI = require('./abis/getReserves.json');
const TOKEN0_ABI = require('./abis/token0.json');
const TOKEN1_ABI = require('./abis/token1.json');
const {
    GRAPH_URL_FUNDS_BSC,
    GRAPH_URL_FUNDS_FANTOM,
    GRAPH_URL_ARBEX_BSC,
    STABLEСOINS_DECIMALS_BY_CHAIN,
    STABLEСOINS_ADDRESSES,
    CHAINS,
    BNB_BISON_APESWAP_PAIR_ADDRESS,
    BNB_BISON_PANCAKESWAP_PAIR_ADDRESS,
    BNB_BISON_SPIRITSWAP_PAIR_ADDRESS,
    fundsTvlQuery,
    arbexTotalUSDLiquidity,
} = require('./constants')
const { getTokenWithChainPrefix, combineTvlParts } = require('./helpers')

async function getReserves(block, pairs, chain) {
    const reserves = await sdk.api.abi.multiCall({
        abi: GET_RESERVES_ABI,
        calls: Object.keys(pairs).map((pairAddress) => ({
            target: pairAddress,
        })),
        block,
        chain
    });

    return reserves.output;
}

async function getPairTokenAddresses(block, pairAddresses, chain) {
    const [token0Addresses, token1Addresses] = await Promise.all([
        sdk.api.abi.multiCall({
            abi: TOKEN0_ABI,
            chain,
            block,
            calls: pairAddresses.map(pairAddress => ({ target: pairAddress })),
        }),
        sdk.api.abi.multiCall({
            abi: TOKEN1_ABI,
            block,
            chain,
            calls: pairAddresses.map(pairAddress => ({ target: pairAddress })),
        }),
    ]);
    return [token0Addresses.output, token1Addresses.output];
}

async function getPairsInfo(pairAddresses, block, chain) {
    const [token0Addresses, token1Addresses] = await getPairTokenAddresses(block, pairAddresses, chain);
    const pairs = {};
    token0Addresses.forEach((token0Address) => {
        const pairAddress = token0Address.input.target.toLowerCase();
        pairs[pairAddress] = {
            token0Address: token0Address.output.toLowerCase(),
        }
    });

    token1Addresses.forEach((token1Address) => {
        const pairAddress = token1Address.input.target.toLowerCase();
        pairs[pairAddress] = {
            ...(pairs[pairAddress] || {}),
            token1Address: token1Address.output.toLowerCase(),
        }
    });
    return pairs;
}


function getPairsBalances(pairs, reserves, chain) {
    return reserves.reduce((memo, reserve) => {
        const pairAddress = reserve.input.target.toLowerCase();
        const pair = pairs[pairAddress] || {};
        const token0WithPrefix = getTokenWithChainPrefix(pair.token0Address, chain)
        const token1WithPrefix = getTokenWithChainPrefix(pair.token1Address, chain)

        if (pair.token0Address) {
            const reserve0 = new BigNumber(reserve.output['0']);
            if (!reserve0.isZero()) {
                const existingBalance = new BigNumber(memo[token0WithPrefix] || '0');
                memo[token0WithPrefix] = existingBalance.plus(reserve0).toFixed()
            }
        }

        if (pair.token1Address) {
            const reserve1 = new BigNumber(reserve.output['1']);
            if (!reserve1.isZero()) {
                const existingBalance = new BigNumber(memo[token1WithPrefix] || '0');
                memo[token1WithPrefix] = existingBalance.plus(reserve1).toFixed()
            }
        }

        return memo
    }, {});
}


async function getDexPairsTvl(pairsAddresses, block, chain) {
    const pairs = await getPairsInfo(pairsAddresses, block, chain)
    const reserves = await getReserves(block, pairs, chain);
    const balances = getPairsBalances(pairs, reserves, chain);
    return balances;
}

const getArbexTvl = async (graphUrl, block, chain) => {
    const { arbExFactories } = await request(
        graphUrl,
        arbexTotalUSDLiquidity,
        { block }
    );
    const usdTvlBN = arbExFactories.reduce((total, p) => total.plus(p.totalLiquidityUSD), new BigNumber(0))
    return { [getTokenWithChainPrefix(STABLEСOINS_ADDRESSES[chain], chain)]: usdTvlBN.times(10 ** STABLEСOINS_DECIMALS_BY_CHAIN[chain]).toFixed(0) }
}

const getFundsTvl = async (graphUrl, block, chain) => {
    const { indexPools } = await request(
        graphUrl,
        fundsTvlQuery,
        { block }
    );
    const usdTvlBN = indexPools.reduce((total, p) => total.plus(p.totalValueLockedUSD), new BigNumber(0))
    return { [getTokenWithChainPrefix(STABLEСOINS_ADDRESSES[chain], chain)]: usdTvlBN.times(10 ** STABLEСOINS_DECIMALS_BY_CHAIN[chain]).toFixed(0) }
}

async function tvlBsc(_, _, chainBlocks) {
    const chain = CHAINS.BSC
    const [fundsTvl, arbexTvl, thirdPartyDexTvl] = await Promise.all([
        getFundsTvl(GRAPH_URL_FUNDS_BSC, chainBlocks[chain], chain),
        getArbexTvl(GRAPH_URL_ARBEX_BSC, chainBlocks[chain], chain),
        getDexPairsTvl([
            BNB_BISON_APESWAP_PAIR_ADDRESS,
            BNB_BISON_PANCAKESWAP_PAIR_ADDRESS
        ], chainBlocks[chain], chain)
    ])

    return combineTvlParts(fundsTvl, arbexTvl, thirdPartyDexTvl)
}

async function tvlFantom(_, _, chainBlocks) {
    const chain = CHAINS.FANTOM
    const [fundsTvl, thirdPartyDexTvl] = await Promise.all([
        getFundsTvl(GRAPH_URL_FUNDS_FANTOM, chainBlocks[chain], chain),
        getDexPairsTvl([
            BNB_BISON_SPIRITSWAP_PAIR_ADDRESS,
        ], chainBlocks[chain], chain)
    ])
    return combineTvlParts(fundsTvl, thirdPartyDexTvl)
}


module.exports = {
    [CHAINS.BSC]: {
        tvl: tvlBsc
    },
    [CHAINS.FANTOM]: {
        tvl: tvlFantom,
    },
    start: 9802672,
    tvl: sdk.util.sumChainTvls([tvlBsc, tvlFantom]),
};
