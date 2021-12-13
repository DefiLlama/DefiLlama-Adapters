const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking');
const { pool2 } = require('../helper/pool2');
const abi = require('./abi.json');

function getBSCAddress(address) {
    return `bsc:${address}`
}

function getHECOAddress(address) {
    return `heco:${address}`
}

const ETH_POOL = "0x8ddc12f593F1c92122D5dda9244b5e749cBFB2e4"

const BSC_POOL = "0x6bA7d75eC6576F88a10bE832C56F0F27DC040dDD"
const BSC_POOL_LP = "0xAdA5598d0E19B4d3C64585b4135c5860d4A0881F"
const BSC_POOL_DAO = "0x4711D9b50353fa9Ff424ceCa47959dCF02b3725A"

const HECO_POOL = "0xAba48B3fF86645ca417f79215DbdA39B5b7cF6b5"
const HECO_POOL_LP = "0x94ad8542f3F1bBb6D0dFa4B91589a264FF9b0056"
const HECO_POOL_DAO = "0x031026064e8f0702a91318e660796139A69Cb89b"

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
    let chain = "ethereum";
    let block = chainBlocks[chain];
    if (block === undefined) {
        block = (await sdk.api.util.lookupBlock(timestamp, { chain: chain })).block;
    }

    let balances = {};

    let pool = ETH_POOL;
    const poolLength = (await sdk.api.abi.call({ target: pool, abi: abi["poolLength"], block: block, chain: chain })).output;
    for (let index = 0; index < poolLength; index++) {
        const poolInfo = (await sdk.api.abi.call({ target: pool, abi: abi['ethPoolInfo'], params: [index], block: block, chain: chain })).output;
        sdk.util.sumSingleBalance(balances, poolInfo.token, poolInfo.totalAmount * 1);
    }

    return balances;
};

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
    let chain = "bsc";
    let block = chainBlocks[chain];
    if (block === undefined) {
        block = (await sdk.api.util.lookupBlock(timestamp, { chain: chain })).block;
    }

    let balances = {};

    {
        let pool = BSC_POOL;
        const poolLength = (await sdk.api.abi.call({ target: pool, abi: abi["poolLength"], block: block, chain: chain })).output;
        for (let index = 0; index < poolLength; index++) {
            const poolInfo = (await sdk.api.abi.call({ target: pool, abi: abi['poolInfo'], params: [index], block: block, chain: chain })).output;
            sdk.util.sumSingleBalance(balances, getBSCAddress(poolInfo.token), poolInfo.totalAmount * 1);
        }
    }

    {
        let pool = BSC_POOL_LP;
        const poolLength = (await sdk.api.abi.call({ target: pool, abi: abi["poolLength"], block: block, chain: chain })).output;
        for (let index = 0; index < poolLength; index++) {
            const poolInfo = (await sdk.api.abi.call({ target: pool, abi: abi['poolInfo'], params: [index], block: block, chain: chain })).output;

            const lp = poolInfo.token;
            const lp_totalAmount = poolInfo.totalAmount;

            const totalSupply = (await sdk.api.abi.call({ target: lp, abi: abi['totalSupply'], params: [], block: block, chain: chain })).output;
            const getReserves = (await sdk.api.abi.call({ target: lp, abi: abi['getReserves'], params: [], block: block, chain: chain })).output;
            const token0 = getBSCAddress((await sdk.api.abi.call({ target: lp, abi: abi['token0'], params: [], block: block, chain: chain })).output);
            const token0_amount = lp_totalAmount * getReserves._reserve0 / totalSupply;
            const token1 = getBSCAddress((await sdk.api.abi.call({ target: lp, abi: abi['token1'], params: [], block: block, chain: chain })).output);
            const token1_amount = lp_totalAmount * getReserves._reserve1 / totalSupply;

            sdk.util.sumSingleBalance(balances, token0, token0_amount);
            sdk.util.sumSingleBalance(balances, token1, token1_amount);
        }
    }

    /*
    {
        let pool = BSC_POOL_DAO;
        const poolLength = (await sdk.api.abi.call({ target: pool, abi: abi["poolLength"], block: block, chain: chain })).output;
        for (let index = 0; index < poolLength; index++) {
            const poolInfo = (await sdk.api.abi.call({ target: pool, abi: abi['daoPoolInfo'], params: [index], block: block, chain: chain })).output;

            const token = poolInfo.token;
            const lock_amount = poolInfo.totalAmount;

            if (lock_amount <= 0) {
                continue
            }

            try {
                const token0 = getBSCAddress((await sdk.api.abi.call({ target: token, abi: abi['token0'], params: [], block: block, chain: chain })).output);
                const token1 = getBSCAddress((await sdk.api.abi.call({ target: token, abi: abi['token1'], params: [], block: block, chain: chain })).output);

                // token is LP Token

                const totalSupply = (await sdk.api.abi.call({ target: token, abi: abi['totalSupply'], params: [], block: block, chain: chain })).output;
                const getReserves = (await sdk.api.abi.call({ target: token, abi: abi['getReserves'], params: [], block: block, chain: chain })).output;

                const token0_amount = lock_amount * getReserves._reserve0 / totalSupply;
                const token1_amount = lock_amount * getReserves._reserve1 / totalSupply;

                sdk.util.sumSingleBalance(balances, token0, token0_amount);
                sdk.util.sumSingleBalance(balances, token1, token1_amount);
            }
            catch(e) {
                // token is ERC20
                sdk.util.sumSingleBalance(balances, getBSCAddress(token), lock_amount * 1);
            }
        }
    }
    */

    return balances;
};

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
    let chain = "heco";
    let block = chainBlocks[chain];
    if (block === undefined) {
        block = (await sdk.api.util.lookupBlock(timestamp, { chain: chain })).block;
    }

    let balances = {};

    {
        let pool = HECO_POOL;
        const poolLength = (await sdk.api.abi.call({ target: pool, abi: abi["poolLength"], block: block, chain: chain })).output;
        for (let index = 0; index < poolLength; index++) {
            const poolInfo = (await sdk.api.abi.call({ target: pool, abi: abi['poolInfo'], params: [index], block: block, chain: chain })).output;
            sdk.util.sumSingleBalance(balances, getHECOAddress(poolInfo.token), poolInfo.totalAmount * 1);
        }
    }

    {
        let pool = HECO_POOL_LP;
        const poolLength = (await sdk.api.abi.call({ target: pool, abi: abi["poolLength"], block: block, chain: chain })).output;
        for (let index = 0; index < poolLength; index++) {
            const poolInfo = (await sdk.api.abi.call({ target: pool, abi: abi['poolInfo'], params: [index], block: block, chain: chain })).output;

            const lp = poolInfo.token;
            const lp_totalAmount = poolInfo.totalAmount;

            const totalSupply = (await sdk.api.abi.call({ target: lp, abi: abi['totalSupply'], params: [], block: block, chain: chain })).output;
            const getReserves = (await sdk.api.abi.call({ target: lp, abi: abi['getReserves'], params: [], block: block, chain: chain })).output;
            const token0 = getHECOAddress((await sdk.api.abi.call({ target: lp, abi: abi['token0'], params: [], block: block, chain: chain })).output);
            const token0_amount = lp_totalAmount * getReserves._reserve0 / totalSupply;
            const token1 = getHECOAddress((await sdk.api.abi.call({ target: lp, abi: abi['token1'], params: [], block: block, chain: chain })).output);
            const token1_amount = lp_totalAmount * getReserves._reserve1 / totalSupply;

            sdk.util.sumSingleBalance(balances, token0, token0_amount);
            sdk.util.sumSingleBalance(balances, token1, token1_amount);
        }
    }

    /*
    {
        let pool = HECO_POOL_DAO;
        const poolLength = (await sdk.api.abi.call({ target: pool, abi: abi["poolLength"], block: block, chain: chain })).output;
        for (let index = 0; index < poolLength; index++) {
            const poolInfo = (await sdk.api.abi.call({ target: pool, abi: abi['daoPoolInfo'], params: [index], block: block, chain: chain })).output;

            const token = poolInfo.token;
            const lock_amount = poolInfo.totalAmount;

            if (lock_amount <= 0) {
                continue
            }

            try {
                const token0 = getHECOAddress((await sdk.api.abi.call({ target: token, abi: abi['token0'], params: [], block: block, chain: chain })).output);
                const token1 = getHECOAddress((await sdk.api.abi.call({ target: token, abi: abi['token1'], params: [], block: block, chain: chain })).output);

                // token is LP Token

                const totalSupply = (await sdk.api.abi.call({ target: token, abi: abi['totalSupply'], params: [], block: block, chain: chain })).output;
                const getReserves = (await sdk.api.abi.call({ target: token, abi: abi['getReserves'], params: [], block: block, chain: chain })).output;

                const token0_amount = lock_amount * getReserves._reserve0 / totalSupply;
                const token1_amount = lock_amount * getReserves._reserve1 / totalSupply;

                sdk.util.sumSingleBalance(balances, token0, token0_amount);
                sdk.util.sumSingleBalance(balances, token1, token1_amount);
            }
            catch(e) {
                // token is ERC20
                sdk.util.sumSingleBalance(balances, getHECOAddress(token), lock_amount * 1);
            }
        }
    }
    */

    return balances;
};

module.exports = {
    methodology: 'TVL counts deposits made to Lossless single asset pools on Ethereum, Heco and Binance Smart Chain and to the various LP farms available on Heco and BSC.',
    ethereum: { tvl: ethTvl },
    bsc: {
        staking: staking(BSC_POOL_DAO, "0x422e3af98bc1de5a1838be31a56f75db4ad43730", "bsc"),
        pool2: pool2(BSC_POOL_DAO, "0xf16d5142086dbf7723b0a57b8d96979810e47448", "bsc"),
        tvl: bscTvl 
    },
    heco: {
        staking: staking(HECO_POOL_DAO, "0x80861a817106665bca173db6ac2ab628a738c737", "heco"),
        pool2: pool2(HECO_POOL_DAO, "0x3f57530bdba9bcd703c8ba75c57cf7de52014036", "heco"),
        tvl: hecoTvl
    },
};
