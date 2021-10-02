const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const { fetchURL } = require('../helper/utils');

const MAINNET_SY_POOLS_API_URL = 'https://api-v2.barnbridge.com/api/smartyield/pools';
const MAINNET_SA_POOLS_API_URL = 'https://api-v2.barnbridge.com/api/smartalpha/pools';

const POLYGON_SY_POOLS_API_URL = 'https://prod-poly-v2.api.barnbridge.com/api/smartyield/pools';
const POLYGON_SA_POOLS_API_URL = 'https://prod-poly-v2.api.barnbridge.com/api/smartalpha/pools';

const STK_AAVE_ADDRESS = '0x4da27a545c0c5b758a6ba100e3a049001de870f5';
const AAVE_ADDRESS = '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9';

async function fetchSyPools(apiUrl) {
    return fetchURL(apiUrl)
        .then(res => res.data)
        .then(({status, data}) => status === 200 ? data : []);
}

async function fetchSaPools(apiUrl) {
    return fetchURL(apiUrl)
        .then(res => res.data)
        .then(({status, data}) => status === 200 ? data : []);
}

function syGetUnderlyingTotal(chain, smartYieldAddress, block) {
    return sdk.api.abi.call({
        abi: {
            name: "underlyingTotal",
            type: "function",
            stateMutability: "view",
            constant: true,
            payable: false,
            inputs: [],
            outputs: [
                {
                    name: "total",
                    type: "uint256",
                    internalType: "uint256",
                },
            ],
        },
        target: smartYieldAddress,
        chain,
        block,
    }).then(({output}) => new BigNumber(output));
}

function saGetEpochBalance(chain, smartAlphaAddress, block) {
    return sdk.api.abi.call({
        abi: {
            name: "epochBalance",
            type: "function",
            stateMutability: "view",
            constant: true,
            payable: false,
            inputs: [],
            outputs: [
                {
                    name: "balance",
                    type: "uint256",
                    internalType: "uint256",
                },
            ],
        },
        target: smartAlphaAddress,
        chain,
        block,
    }).then(({output}) => new BigNumber(output));
}

function saGetQueuedJuniorsUnderlyingIn(chain, smartAlphaAddress, block) {
    return sdk.api.abi.call({
        abi: {
            name: "queuedJuniorsUnderlyingIn",
            type: "function",
            stateMutability: "view",
            constant: true,
            payable: false,
            inputs: [],
            outputs: [
                {
                    name: "amount",
                    type: "uint256",
                    internalType: "uint256",
                },
            ],
        },
        target: smartAlphaAddress,
        chain,
        block,
    }).then(({output}) => new BigNumber(output));
}

function saGetQueuedSeniorsUnderlyingIn(chain, smartAlphaAddress, block) {
    return sdk.api.abi.call({
        abi: {
            name: "queuedSeniorsUnderlyingIn",
            type: "function",
            stateMutability: "view",
            constant: true,
            payable: false,
            inputs: [],
            outputs: [
                {
                    name: "amount",
                    type: "uint256",
                    internalType: "uint256",
                },
            ],
        },
        target: smartAlphaAddress,
        chain,
        block,
    }).then(({output}) => new BigNumber(output));
}

function resolveAddress(address) {
    switch (address) {
        case STK_AAVE_ADDRESS:
            return AAVE_ADDRESS;
        default:
            return address;
    }
}

function sumTvl(tvlList = []) {
    return async (...args) => {
        const results = await Promise.all(tvlList.map(fn => fn(...args)));
        return results.reduce((a, c) => Object.assign(a, c), {});
    };
}

async function mainnetTvl(timestamp, ethBlock) {
    const chain = 'ethereum';
    const block = ethBlock;
    const balances = {}

    // calculate TVL from SmartYield pools
    const syPools = await fetchSyPools(MAINNET_SY_POOLS_API_URL);

    await Promise.all(syPools.map(async syPool => {
        const {smartYieldAddress, underlyingAddress} = syPool;
        const underlyingTotal = await syGetUnderlyingTotal(chain, smartYieldAddress, block);

        sdk.util.sumSingleBalance(balances, chain+':'+resolveAddress(underlyingAddress), underlyingTotal.toFixed(0));
    }));

    // calculate TVL from SmartAlpha pools
    const saPools = await fetchSaPools(MAINNET_SA_POOLS_API_URL);

    await Promise.all(saPools.map(async saPool => {
        const {poolAddress, poolToken} = saPool;
        const [epochBalance, queuedJuniorsUnderlyingIn, queuedSeniorsUnderlyingIn] = await Promise.all([
            saGetEpochBalance(chain, poolAddress, block),
            saGetQueuedJuniorsUnderlyingIn(chain, poolAddress, block),
            saGetQueuedSeniorsUnderlyingIn(chain, poolAddress, block),
        ]);

        const underlyingTotal = epochBalance
            .plus(queuedJuniorsUnderlyingIn)
            .plus(queuedSeniorsUnderlyingIn);
        sdk.util.sumSingleBalance(balances, chain+':'+resolveAddress(poolToken.address), underlyingTotal.toFixed(0));
    }));

    return balances;
}

async function polygonTvl(timestamp, _, chainBlocks) {
    const chain = 'polygon';
    const block = chainBlocks[chain];
    const balances = {}

    // calculate TVL from SmartYield pools
    const syPools = await fetchSyPools(POLYGON_SY_POOLS_API_URL);

    await Promise.all(syPools.map(async syPool => {
        const {smartYieldAddress, underlyingAddress} = syPool;
        const underlyingTotal = await syGetUnderlyingTotal(chain, smartYieldAddress, block);

        sdk.util.sumSingleBalance(balances, chain+':'+resolveAddress(underlyingAddress), underlyingTotal.toFixed(0));
    }));

    // calculate TVL from SmartAlpha pools
    const saPools = await fetchSaPools(POLYGON_SA_POOLS_API_URL);

    await Promise.all(saPools.map(async saPool => {
        const {poolAddress, poolToken} = saPool;
        const [epochBalance, queuedJuniorsUnderlyingIn, queuedSeniorsUnderlyingIn] = await Promise.all([
            saGetEpochBalance(chain, poolAddress, block),
            saGetQueuedJuniorsUnderlyingIn(chain, poolAddress, block),
            saGetQueuedSeniorsUnderlyingIn(chain, poolAddress, block),
        ]);

        const underlyingTotal = epochBalance
            .plus(queuedJuniorsUnderlyingIn)
            .plus(queuedSeniorsUnderlyingIn);
        sdk.util.sumSingleBalance(balances, chain+':'+resolveAddress(poolToken.address), underlyingTotal.toFixed(0));
    }));

    return balances;
}

module.exports = {
    start: 1615564559, // Mar-24-2021 02:17:40 PM +UTC
    ethereum: {
        tvl: mainnetTvl,
    },
    polygon: {
        tvl: polygonTvl
    },
    tvl: sumTvl([mainnetTvl, polygonTvl]),
};
