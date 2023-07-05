const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensAndLPsSharedOwners, sumTokens2 } = require('../helper/unwrapLPs')
const { stakingPricedLP, staking } = require("../helper/staking");
const { stakingUnknownPricedLPInSyncSwap, pool2sEthereum, pool2sEra } = require("./utils");
const { default: BigNumber } = require('bignumber.js');

// --------------------------

const ethTiTiToken = "0x3bdffA70f4b4E6985eED50453c7C0D4A15dcEc52";   // TiTi Token
const ethTiTiStaking = "0x5390Dbf4958F21BB317C72744c110977F4c03311";    // TiTi Staking
const ethTiUSDToken = "0x6eff556748ee452cbdaf31bcb8c76a28651509bd";

const eraTiTiToken = "0x4EBfb78C4780C304dff7de518db630b67e3F044b";    // TiTi Token Era
const eraTiTiStaking = "0x1B05972C2e46288201E0432262bd8e925d4fCF94";    // TiTi Staking Era
const eraTiUSDToken = "0xc059767cb62f003e863f9e7bd1fc813beff9693c";


async function ethTvl() {
    const balances = {};

    const ownerAddresses = [
        "0x49a0c2076DE4801bcadFEf78d0FA63cEC0AD1cB4",    // MAMMSwapPair
    ];
    
    const tokenAddresses = [
        [ADDRESSES.ethereum.USDC, false],   // USDC
        [ethTiUSDToken, false]    // TiUSD
    ];
    
    await sumTokensAndLPsSharedOwners(balances, tokenAddresses, ownerAddresses);
    
    let usdcBal = BigNumber(balances[ADDRESSES.ethereum.USDC]);
    let tiusdBal = BigNumber(balances[ethTiUSDToken]);

    balances[ADDRESSES.ethereum.USDC] = usdcBal.plus(tiusdBal.div(BigNumber(10**12))).toFixed(0);

    return balances;
}

// zksync era
async function eraTvl(timestamp, _ethBlock, {["era"]: block}) {
    let balances = {};

    const ownerAddresses = [
        "0xc856175575F6406b59AD6822c3114494990750DC",    // MAMMSwapPair
    ];

    const tokenAddresses = [
        [ADDRESSES.era.USDC, false],   // USDC
        [eraTiUSDToken, false]    // TiUSD
    ];
    // const tokenAddresses = [
    //     ADDRESSES.era.USDC,    // USDC
    // ];

    // balances = await sumTokens2({ api, tokens: tokenAddresses, owners: ownerAddresses });
    // console.log(balances)
    // return balances;

    await sumTokensAndLPsSharedOwners(balances, tokenAddresses, ownerAddresses, block, "era");

    let usdcBal = BigNumber(balances['era:0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4']);
    let tiusdBal = BigNumber(balances['era:0xc059767cb62f003e863f9e7bd1fc813beff9693c']);

    balances['era:0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4'] = usdcBal.plus(tiusdBal.div(BigNumber(10**12))).toFixed(0);

    return balances;
}

module.exports = {
    methodology: `Calculate the reserve-type assets locked in the contract, including the user's stake funds in MarketMakerFund and the reserve of TiUSD issued by the protocol, TiTi-AMMs used to provide liquidity TiUSD is not included`,
    ethereum: {
        tvl: ethTvl,
        // staking: staking([ethTiTiStaking], ethTiTiToken, "ethereum")
        staking: stakingPricedLP(ethTiTiStaking, ethTiTiToken, 'ethereum', "0xca4AEf99b3567Dbb631DF0DCd51D446DB7eb63e5", "usd-coin", true, 6),
        pool2: pool2sEthereum(
            ["0x9A132b777FE7af6561BAAb60A03302C697fA8F3B"],
            ["0x830Ce3859F98104DC600efBFAD90A65386B95404"],
            "0xca4AEf99b3567Dbb631DF0DCd51D446DB7eb63e5",
            "ethereum"
        )
    },
    era: {
        tvl: eraTvl,
        staking: stakingUnknownPricedLPInSyncSwap(eraTiTiStaking, eraTiTiToken, 'era', "0x512f5a62eE69013643f37C12fd8Be391Db7b4550", "usd-coin", 6),
        pool2: pool2sEra(
            [
                "0xA690DC59d6afC12d6789f46fc211DdD27f1C7f7c",
                "0x2cbCE1EFC624138326877C386692E889D8C7c834",
                "0xDc8440CdC50bEe0936bB49De82e80c2439dCEc42"
            ],
            [
                "0x574E2E833A010997840f368edF6542d8950c2788",
                "0x228D400F196760432BD8bcE74Fa1e6580aF4BF03",
                "0xd4cb4f38de684122Af261ee822Dc1437601e5424"
            ],
            "0x512f5a62eE69013643f37C12fd8Be391Db7b4550",
            "era"
        )
    },
}