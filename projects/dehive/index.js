const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const abi = require('./abi.json')

const stakingInfo = require("./stakingInfo");

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

    if (!!meta.dhvToken) {
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

// TODO
// async function clusterStakingTvl(){}

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

async function chainTvl(chain, chainBlocks) {
    const tvl = {};
    const transform = addr => `${chain}:${addr}`
    const block = chainBlocks[chain]
    for (const staking of stakingInfo[chain]) {
        let stakingTvlFunction = undefined;
        switch (staking.tvl) {
            case "stakingTvl":
                stakingTvlFunction = stakingTvl;
                break;
            case "stakingDhvTvl":
                stakingTvlFunction = stakingDhvTvl;
                break;
            case "lpStakingTvl":
                stakingTvlFunction = lpStakingTvl;
                break;
            case "crvStakingTvl":
                stakingTvlFunction = crvStakingTvl;
                break;
            case "clusterTvl":
                stakingTvlFunction = clusterTvl;
                break;
            case "impulseStakingTvl":
                stakingTvlFunction = impulseStakingTvl;
                break;
            default:
                console.log('unknown tvl type', JSON.stringify(staking, null,4));
                continue;
        }
        const tvls = await stakingTvlFunction(chain, staking.meta, block);
        if (typeof tvls === 'string') {
            sdk.util.sumSingleBalance(tvl, transform(staking.meta.tokenAddress), tvls)
        } else {
            for (let i = 0; i < tvls.length; i++) {
                sdk.util.sumSingleBalance(tvl, transform(tvls[i][0]), tvls[i][1])
            }
        }
    }
    return tvl
}

async function ethereumTvl(timestamp, ethBlock, chainBlocks) {
    return chainTvl('ethereum', chainBlocks)
}

async function polygonTvl(timestamp, ethBlock, chainBlocks) {
    return chainTvl('polygon', chainBlocks);
}

async function bscTvl(timestamp, ethBlock, chainBlocks) {
    return chainTvl('bsc', chainBlocks);
}

async function xdaiTvl(timestamp, ethBlock, chainBlocks) {
    return chainTvl('xdai', chainBlocks)
}


module.exports = {
    ethereum: {
        tvl: ethereumTvl
    },
    polygon: {
        tvl: polygonTvl
    },
    bsc: {
        tvl: bscTvl
    },
    xdai: {
        tvl: xdaiTvl
    }
};
