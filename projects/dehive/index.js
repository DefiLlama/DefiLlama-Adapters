const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const abi = require('./abi.json')

const assetsInfo = require("./assetsInfo");

const EXPORT_TYPE_TVL = 0;
const EXPORT_TYPE_DHV_STAKING = 1;
const EXPORT_TYPE_POOL2 = 2;

async function stakingTvl(chain, meta, ethBlock) {
    return (await sdk.api.abi.call({
        target: meta.stakingAddress,
        abi: abi.poolInfo,
        params: meta.poolId,
        chain,
        block: ethBlock
    })).output.poolSupply;
}

async function stakingDhvTvl(chain, meta, ethBlock) {
    return (await sdk.api.abi.call({
        target: meta.tokenAddress,
        abi: abi.balanceOf,
        params: meta.stakingAddress,
        chain,
        block: ethBlock
    })).output;
}

async function lpStakingTvl(chain, meta, ethBlock) {
    const { poolSupply } = (await sdk.api.abi.call({
        target: meta.stakingAddress,
        abi: abi.poolInfo,
        params: meta.poolId,
        chain,
        block: ethBlock
    })).output;
    const poolSupplyBN = new BigNumber(poolSupply);

    const lpTotalSupply = (await sdk.api.abi.call({
        target: meta.lpAddress,
        abi: abi.totalSupply,
        chain,
        block: ethBlock
    })).output;
    const lpTotalSupplyBN = new BigNumber(lpTotalSupply);

    const tvl = [];
    for (let i = 0; i < meta.underlying.length; i++) {
        const underlyingLpBalance = (await sdk.api.abi.call({
            target: meta.underlying[i],
            abi: abi.balanceOf,
            params: meta.lpAddress,
            chain,
            block: ethBlock
        })).output;
        const underlyingLpBalanceBN = new BigNumber(underlyingLpBalance);
        const underlyingTvl = poolSupplyBN.multipliedBy(underlyingLpBalanceBN).div(lpTotalSupplyBN);

        tvl.push([meta.underlying[i], underlyingTvl.integerValue().toFixed()]);
    }

    if (meta.dhvToken) {
        const dhvBalance = (await sdk.api.abi.call({
            target: meta.dhvToken,
            abi: abi.balanceOf,
            params: meta.stakingAddress,
            chain,
            block: ethBlock
        })).output;
        tvl.push([meta.dhvToken, dhvBalance]);
    }
    return tvl;
}

async function crvStakingTvl(chain, meta, ethBlock) {
    const { strategy } = (await sdk.api.abi.call({
        target: meta.stakingAddress,
        abi: abi.impulseMultiPoolInfo,
        params: meta.poolId,
        chain,
        block: ethBlock
    })).output;

    const wantLockedTotal = (await sdk.api.abi.call({
        target: strategy,
        abi: abi.wantLockedTotal,
        chain,
        block: ethBlock
    })).output;

    const underlyingList = (await sdk.api.abi.call({
        target: strategy,
        abi: abi.listUnderlying,
        chain,
        block: ethBlock
    })).output;

    const underlyingAmount = (await sdk.api.abi.call({
        target: strategy,
        abi: abi.wantPriceInUnderlying,
        params: wantLockedTotal,
        chain,
        block: ethBlock
    })).output;

    return underlyingList.map((_, i) => [underlyingList[i], underlyingAmount[i]]);
}

async function impulseStakingTvl(chain, meta, ethBlock) {
    if (chain === 'bsc') {
        return await lpStakingTvl(chain, meta, ethBlock); // from staking pool
    }
    const { strategy } = (await sdk.api.abi.call({
        target: meta.stakingAddress,
        abi: abi.impulseMultiPoolInfo,
        params: meta.poolId,
        chain,
        block: ethBlock
    })).output;

    const wantLockedTotal = (await sdk.api.abi.call({
        target: strategy,
        abi: abi.wantLockedTotal,
        chain,
        block: ethBlock
    })).output;

    const usdToken = (await sdk.api.abi.call({
        target: strategy,
        abi: abi.usdToken,
        chain,
        block: ethBlock
    })).output;

    const wantPrice = (await sdk.api.abi.call({
        target: strategy,
        abi: abi.wantPriceInUsd,
        params: wantLockedTotal,
        chain,
        block: ethBlock
    })).output;

    let tvl = await lpStakingTvl(chain, meta, ethBlock); // from staking pool
    tvl.push([usdToken, wantPrice]); // from strategy

    return tvl;
}

async function clusterTvl(chain, meta, ethBlock) {
    const poolSupply = (await sdk.api.abi.call({
        target: meta.clusterAddress,
        abi: "erc20:totalSupply",
        chain,
        block: ethBlock
    })).output;

    const underlyingList = (await sdk.api.abi.call({
        target: meta.clusterAddress,
        abi: abi.getUnderlyings,
        chain,
        block: ethBlock
    })).output;

    const underlyingAmount = (await sdk.api.abi.call({
        target: meta.clusterAddress,
        abi: abi.getUnderlyingsAmountsFromClusterAmount,
        params: poolSupply,
        chain,
        block: ethBlock
    })).output;

    return underlyingList.map((_, i) => [underlyingList[i], underlyingAmount[i]]);
}

async function chainTvl(chain, chainBlocks, exportType) {
    const tvl = {};
    const transform = addr => `${chain}:${addr}`
    const block = chainBlocks[chain]
    await Promise.all(assetsInfo[chain].map(async (staking) => {
        {
            let calculateTvlFunction = undefined;
            switch (staking.tvl) {
                case "stakingTvl":
                    calculateTvlFunction = stakingTvl;
                    break;
                case "stakingDhvTvl":
                    calculateTvlFunction = stakingDhvTvl;
                    break;
                case "lpStakingTvl":
                    calculateTvlFunction = lpStakingTvl;
                    break;
                case "crvStakingTvl":
                    calculateTvlFunction = crvStakingTvl;
                    break;
                case "clusterTvl":
                    calculateTvlFunction = clusterTvl;
                    break;
                case "impulseStakingTvl":
                    calculateTvlFunction = impulseStakingTvl;
                    break;
                default:
                    console.log('unknown tvl type', JSON.stringify(staking, null, 4));
                    return;
            }
            if (
                (staking.tvl === "stakingDhvTvl" && exportType !== EXPORT_TYPE_DHV_STAKING)
                || (staking.tvl !== "stakingDhvTvl" && exportType === EXPORT_TYPE_DHV_STAKING)
                || (staking.tvl === "lpStakingTvl" && exportType === EXPORT_TYPE_POOL2 && (staking.isPool2 !== true))
                || (staking.tvl === "lpStakingTvl" && exportType !== EXPORT_TYPE_POOL2 && (staking.isPool2 === true))
            ) {
                return;
            }
            const tvls = await calculateTvlFunction(chain, staking.meta, block);
            if (typeof tvls === 'string') {
                sdk.util.sumSingleBalance(tvl, transform(staking.meta.tokenAddress), tvls)
            } else {
                for (let i = 0; i < tvls.length; i++) {
                    sdk.util.sumSingleBalance(tvl, transform(tvls[i][0]), tvls[i][1])
                }
            }
        }
    }))
    return tvl
}

async function ethereumTvl(timestamp, ethBlock, chainBlocks) {
    return chainTvl('ethereum', chainBlocks, EXPORT_TYPE_TVL);
}

async function polygonTvl(timestamp, ethBlock, chainBlocks) {
    return chainTvl('polygon', chainBlocks, EXPORT_TYPE_TVL);
}

async function bscTvl(timestamp, ethBlock, chainBlocks) {
    return chainTvl('bsc', chainBlocks, EXPORT_TYPE_TVL);
}

async function xdaiTvl(timestamp, ethBlock, chainBlocks) {
    return chainTvl('xdai', chainBlocks, EXPORT_TYPE_TVL);
}

async function ethereumStaking(timestamp, ethBlock, chainBlocks) {
    return chainTvl('ethereum', chainBlocks, EXPORT_TYPE_DHV_STAKING);
}

async function polygonStaking(timestamp, ethBlock, chainBlocks) {
    return chainTvl('polygon', chainBlocks, EXPORT_TYPE_DHV_STAKING);
}

async function bscStaking(timestamp, ethBlock, chainBlocks) {
    return chainTvl('bsc', chainBlocks, EXPORT_TYPE_DHV_STAKING);
}

async function xdaiStaking(timestamp, ethBlock, chainBlocks) {
    return chainTvl('xdai', chainBlocks, EXPORT_TYPE_DHV_STAKING);
}

async function ethereumPool2(timestamp, ethBlock, chainBlocks) {
    return chainTvl('ethereum', chainBlocks, EXPORT_TYPE_POOL2);
}

async function polygonPool2(timestamp, ethBlock, chainBlocks) {
    return chainTvl('polygon', chainBlocks, EXPORT_TYPE_POOL2);
}

async function bscPool2(timestamp, ethBlock, chainBlocks) {
    return chainTvl('bsc', chainBlocks, EXPORT_TYPE_POOL2);
}

async function xdaiPool2(timestamp, ethBlock, chainBlocks) {
    return chainTvl('xdai', chainBlocks, EXPORT_TYPE_POOL2);
}


module.exports = {
    ethereum: {
        tvl: ethereumTvl,
        pool2: ethereumPool2,
        staking: ethereumStaking
    },
    polygon: {
        tvl: polygonTvl,
        pool2: polygonPool2,
        staking: polygonStaking
    },
    bsc: {
        tvl: bscTvl,
        pool2: bscPool2,
        staking: bscStaking
    },
    xdai: {
        tvl: xdaiTvl,
        pool2: xdaiPool2,
        staking: xdaiStaking
    }
};
