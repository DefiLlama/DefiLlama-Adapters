const sdk = require("@defillama/sdk");
// const erc20Abi = require("../helper/abis/erc20.json");
// const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const {
    chainIds,
    chainNameById,
    cryptexConfig,
    chainConfigs,
} = require('./cryptex-config');

const { getLockerPairAddresses, getVestInstances } = require('./cryptex-helper');

/*
const fetchTVLByLPLocker = async (locker, chainId, block) => {
    const chainName = chainNameById[chainId];
    let balances = {};
    if (locker.address) {

        const pairs = await getLockerPairAddresses(
            locker.address,
            chainName,
            locker.deployBlock,
            block
        );

        const lpBalances = (await sdk.api.abi.multiCall({
            abi: erc20Abi.balanceOf,
            chain: chainName,
            calls: pairs.map(pair => ({
                target: pair,
                params: [locker.address],
            }))
        })).output;

        let lpPositions = [];
        
        lpBalances.forEach((p) => {
            lpPositions.push({
                balance: p.output,
                token: p.input.target,
            });
        });
        
        await unwrapUniswapLPs(
            balances,
            lpPositions,
            undefined,
            chainName,
            (addr) => `${chainName}:${addr}`
        );
    }

    return balances;
}

const fetchTVLByVestingLocker = async (vesting, chainId, block) => {
    const chainName = chainNameById[chainId];
    let balances = {};
    if (vesting.address) {
        const vestInstances = await getVestInstances(
            vesting.address,
            chainName,
            vesting.deployBlock,
            block
        );

        const instanceBalances = (await sdk.api.abi.multiCall({
            abi: erc20Abi.balanceOf,
            chain: chainName,
            calls: vestInstances.map(item => ({
                target: item.token,
                params: [item.instance],
            }))
        })).output;

        instanceBalances.forEach((item) => {
            sdk.util.sumSingleBalance(balances, `${chainName}:${item.input.target}`, item.output);; 
        })
    }

    return balances;
}

const fetchTVL = (chainId) => {
    return async (timestamp, ethBlock, chainBlocks) => {
        const lockers = (chainConfigs[chainId]?.lockers || []);
        const vesting = (chainConfigs[chainId]?.vesting || {})
        const chainName = chainNameById[chainId];
        const block = chainBlocks[chainName];
        const balances = {};

        const vestingBalances = await fetchTVLByVestingLocker(vesting, chainId, block);

        Object.keys(vestingBalances).forEach((key) => {
            sdk.util.sumSingleBalance(balances, key, vestingBalances[key]);
        });

        for (let i = 0; i < lockers.length; i++) {
            const locker = lockers[i];
            const data = await fetchTVLByLPLocker(locker, chainId, block);

            Object.keys(data).forEach((key) => {
                sdk.util.sumSingleBalance(balances, key, data[key]);
            });
        }

        return balances;
        
    }
}
*/
const fetchStaking = async (timestamp, block, chainBlocks) => {
    let balances = {};
    
    const v1Balance = (await sdk.api.erc20.balanceOf({
        target: cryptexConfig.crxToken,
        owner: cryptexConfig.staking.V1,
        chain: "bsc",
        block: chainBlocks.bsc
    })).output;

    const v2Balance = (await sdk.api.erc20.balanceOf({
        target: cryptexConfig.crxToken,
        owner: cryptexConfig.staking.V2,
        chain: "bsc",
        block: chainBlocks.bsc
    })).output;

    sdk.util.sumSingleBalance(balances, `bsc:${cryptexConfig.crxToken}`, v1Balance);
    sdk.util.sumSingleBalance(balances, `bsc:${cryptexConfig.crxToken}`, v2Balance);

    return balances;
}

// const excludedChains = [chainIds.bsc, chainIds.polygon];
/*
const chainCalcs = Object.keys(chainIds).reduce((acc, key) => {
    const chainId = chainIds[key];
    
    // if (excludedChains.indexOf(chainId) !== -1) return acc;

    const calcs = {
        tvl: fetchTVL(chainId),
    }

    if (chainId === 56) {
        calcs.staking = fetchStaking;
    }

    acc[key] = calcs;
    return acc;
}, {});
*/
module.exports = {
    methodology: "TVL includes locked LP tokens and vested team tokens",
    bsc: {
        tvl: ()=>({}),
        staking: fetchStaking
    }
};