const sdk = require("@defillama/sdk");
const Result = require("./Helpers/Result");
const YelLPFarm = require("./Providers/YelLPFarm");
const addr = require("./config/addresses.json");
const YelEnhancedLpFarm = require("./Providers/YelEnhancedLpFarm");
const YelSingleStaking = require("./Providers/YelSingleStaking");
const YelEnhancedSingleStake = require("./Providers/YelEnhancedSingleStake");

async function ethereumTvl() {
    const [
        yelInLpEth,
        yelInLpBsc,
        yelInLpFantom,
        yelInLpPolygon,
        wethInLp,
        ifarmEnhanced,
        yelSSEth,
        yelSSBsc,
        yelSSFantom,
        yelSSPolygon,
    ] = await Promise.all([
        YelLPFarm.yelTokensInLp(addr.yelFarmingContract.ethereum, 'ethereum'),
        YelLPFarm.yelTokensInLp(addr.yelFarmingContract.bsc, 'bsc'),
        YelLPFarm.yelTokensInLp(addr.yelFarmingContract.fantom, 'fantom'),
        YelLPFarm.yelTokensInLp(addr.yelFarmingContract.polygon, 'polygon'),
        YelLPFarm.nonYELTokensInLP(addr.yelFarmingContract.ethereum, 'ethereum'),
        YelEnhancedSingleStake.getStakedTokens(addr.yelEnhancedPools.ethereum.ifarm, 'ethereum'),
        YelSingleStaking.getStakedYel(addr.yelFarmingContract.ethereum, 'ethereum'),
        YelSingleStaking.getStakedYel(addr.yelFarmingContract.bsc, 'bsc'),
        YelSingleStaking.getStakedYel(addr.yelFarmingContract.fantom, 'fantom'),
        YelSingleStaking.getStakedYel(addr.yelFarmingContract.polygon, 'polygon'),
    ])
    return (new Result(yelInLpEth))
        .append(yelInLpBsc)
        .append(yelInLpFantom)
        .append(yelInLpPolygon)
        .append(wethInLp)
        .append(ifarmEnhanced)
        .append(yelSSEth)
        .append(yelSSBsc)
        .append(yelSSFantom)
        .append(yelSSPolygon)
        .render();
}

async function bscTvl() {
    const [
        bnbInYel,
        bananaBnb
    ] = await Promise.all([
        YelLPFarm.nonYELTokensInLP(addr.yelFarmingContract.bsc, 'bsc'),
        YelEnhancedLpFarm.tokensInLP(addr.yelEnhancedPools.bsc.bnbBanana, 'bsc')
    ])
    return (new Result(bnbInYel))
        .append(bananaBnb)
        .render();
}

async function ftmTvl() {
    const [
        ftmInYel,
        ftmBoo,
        anySwap
    ] = await Promise.all([
        YelLPFarm.nonYELTokensInLP(addr.yelFarmingContract.fantom, 'fantom'),
        YelEnhancedLpFarm.tokensInLP(addr.yelEnhancedPools.fantom.ftmBoo, 'fantom'),
        YelEnhancedSingleStake.getStakedTokens(addr.yelEnhancedPools.fantom.anySwap, 'fantom', 2)
    ])
    return (new Result(ftmInYel))
        .append(ftmBoo)
        .append(anySwap)
        .render();
}

async function maticTvl() {
    const [
        maticInYel,
        dQuick
    ] = await Promise.all([
        YelLPFarm.nonYELTokensInLP(addr.yelFarmingContract.polygon, 'polygon'),
        YelEnhancedSingleStake.getStakedTokens(addr.yelEnhancedPools.polygon.dQuick, 'polygon', 2)
    ])
    return (new Result(maticInYel))
        .append(dQuick)
        .render();
}


module.exports = {
    staking: {
        ethereum: {
            tvl: ethereumTvl,
        },
        bsc: {
            tvl: bscTvl,
        },
        fantom: {
            tvl: ftmTvl,
        },
        polygon: {
            tvl: maticTvl,
        },
    },
    methodology: "Lorem ipsum",
    tvl: sdk.util.sumChainTvls([ethereumTvl, bscTvl, ftmTvl, maticTvl]),
};
