const sdk = require("@defillama/sdk");
const Result = require("./Helpers/Result");
const YelLPFarm = require("./Providers/YelLPFarm");
const addr = require("./config/addresses.json");
const YelEnhancedLpFarm = require("./Providers/YelEnhancedLpFarm");
const YelSingleStaking = require("./Providers/YelSingleStaking");
const YelEnhancedSingleStake = require("./Providers/YelEnhancedSingleStake");

async function ethereumStaking() {
    const [
        ifarmEnhanced,
        yelSSEth,
    ] = await Promise.all([
        YelEnhancedSingleStake.getStakedTokens(addr.yelEnhancedPools.ethereum.ifarm, 'ethereum'),
        YelSingleStaking.getStakedYel(addr.yelFarmingContract.ethereum, 'ethereum'),
    ])
    return (new Result(ifarmEnhanced))
        .append(yelSSEth)
        .render();
}

async function bscStaking() {
    return await YelSingleStaking.getStakedYel(addr.yelFarmingContract.bsc, 'bsc');
}

async function ftmStaking() {
    const [
        anySwap,
        yelSSFantom
    ] = await Promise.all([
        YelEnhancedSingleStake.getStakedTokens(addr.yelEnhancedPools.fantom.anySwap, 'fantom', 2),
        YelSingleStaking.getStakedYel(addr.yelFarmingContract.fantom, 'fantom'),
    ])
    return (new Result(anySwap))
        .append(yelSSFantom)
        .render();
}

async function maticStaking() {
    const [
        yelInLpPolygon,
        dQuick
    ] = await Promise.all([
        YelEnhancedSingleStake.getStakedTokens(addr.yelEnhancedPools.polygon.dQuick, 'polygon', 2),
        YelSingleStaking.getStakedYel(addr.yelFarmingContract.polygon, 'polygon'),
    ])
    return (new Result(dQuick))
        .append(yelInLpPolygon)
        .render();
}

async function ethereumPool2() {
    const [
        yelInLpEth,
        wethInLp,
    ] = await Promise.all([
        YelLPFarm.yelTokensInLp(addr.yelFarmingContract.ethereum, 'ethereum'),
        YelLPFarm.nonYELTokensInLP(addr.yelFarmingContract.ethereum, 'ethereum'),
    ])
    return (new Result(yelInLpEth))
        .append(wethInLp)
        .render();
}

async function bscPool2() {
    const [
        bnbInYel,
        yelInLpBsc,
        bananaBnb,
    ] = await Promise.all([
        YelLPFarm.nonYELTokensInLP(addr.yelFarmingContract.bsc, 'bsc'),
        YelLPFarm.yelTokensInLp(addr.yelFarmingContract.bsc, 'bsc'),
        YelEnhancedLpFarm.tokensInLP(addr.yelEnhancedPools.bsc.bnbBanana, 'bsc'),
    ])
    return (new Result(bnbInYel))
        .append(bananaBnb)
        .append(yelInLpBsc)
        .render();
}

async function ftmPool2() {
    const [
        ftmInYel,
        yelInLpFantom,
        ftmBoo,
    ] = await Promise.all([
        YelLPFarm.nonYELTokensInLP(addr.yelFarmingContract.fantom, 'fantom'),
        YelLPFarm.yelTokensInLp(addr.yelFarmingContract.fantom, 'fantom'),
        YelEnhancedLpFarm.tokensInLP(addr.yelEnhancedPools.fantom.ftmBoo, 'fantom')
    ])
    return (new Result(ftmInYel))
        .append(ftmBoo)
        .append(yelInLpFantom)
        .render();
}

async function maticPool2() {
    const [
        maticInYel,
        yelInLpPolygon,
    ] = await Promise.all([
        YelLPFarm.nonYELTokensInLP(addr.yelFarmingContract.polygon, 'polygon'),
        YelLPFarm.yelTokensInLp(addr.yelFarmingContract.polygon, 'polygon'),
    ])
    return (new Result(maticInYel))
        .append(yelInLpPolygon)
        .render();
}

async function tvl() { 
    return {}; 
}

module.exports = {
    ethereum: {
        staking: ethereumStaking,
        pool2: ethereumPool2
    },
    bsc: {
        staking: bscStaking,
        pool2: ethereumPool2
    },
    fantom: {
        staking: ftmStaking,
        pool2: ftmPool2
    },
    polygon: {
        staking: maticStaking,
        pool2: maticPool2
    },
    tvl,
    methodology: "TVL is accounted from YEL liquidity mining farms, enhanced pools, partner farms and other protocols. Basically, that’s all the funds held at YEL Finance smart-contracts.",
};
// node test.js projects/yel/index.js