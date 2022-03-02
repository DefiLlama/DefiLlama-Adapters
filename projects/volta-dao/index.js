const { stakingUnknownPricedLP } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const { BigNumber } = require("bignumber.js");

const ftmToken = "0x4c9993c7107495020c2ce9a13d11839f48ecd2e6";
const ftmStaking = "0xc6a54adddf7463f73a4c5a8e3e480bc798cf8a09";
const ftmTreasury = "0x05ab17e4dfa87ef4ac487ed20cfcc2ae75c2a792";
const ftmTokens = [
    ["0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", false],
    ["0x78b51a1fd7524186982c2cb8982df312b1e896a8", true]
];

const avaxToken = "0x4c9993c7107495020c2ce9a13d11839f48ecd2e6";
const avaxStaking = "0xfae672012b90cfb6bf245ac072a3aca374604b17";
const avaxTreasury = "0x05ab17e4dfa87ef4ac487ed20cfcc2ae75c2a792";
const avaxTokens = [
    ["0xd586e7f844cea2f87f50152665bcbc2c279d8d70", false],
    ["0x26e7c9b2890440866d7d3f8f84b1ccaff443b9d8", true]
]

async function tokenPrice(block, chain, lp, unlisted, listed) {
    const tokensInLP = (await sdk.api.abi.multiCall({
        calls: [
            {
                target: unlisted,
                params: lp
            },
            {
                target: listed,
                params: lp
            }
        ],
        abi: "erc20:balanceOf",
        block,
        chain
    })).output;
    return Number(tokensInLP[1].output) / Number(tokensInLP[0].output);
}

async function ftmTvl (timestamp, block, chainBlocks) {
    let balances = {};
    await sumTokensAndLPsSharedOwners(balances, ftmTokens, [ftmTreasury], chainBlocks.fantom, "fantom", addr=>`fantom:${addr}`);
    const ratio = await tokenPrice(chainBlocks.fantom, "fantom", "0x78b51a1fd7524186982c2cb8982df312b1e896a8", ftmToken, "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e");
    sdk.util.sumSingleBalance(balances, "fantom:0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", BigNumber(balances["fantom:0x4c9993c7107495020c2ce9a13d11839f48ecd2e6"]).times(ratio).toFixed(0));
    delete balances["fantom:0x4c9993c7107495020c2ce9a13d11839f48ecd2e6"];
    return balances;
}

async function avaxTvl (timestamp, block, chainBlocks) {
    let balances = {};
    await sumTokensAndLPsSharedOwners(balances, avaxTokens, [avaxTreasury], chainBlocks.avax, "avax", addr=>`avax:${addr}`);
    const ratio = await tokenPrice(chainBlocks.avax,"avax", "0x26e7c9b2890440866d7d3f8f84b1ccaff443b9d8", avaxToken, "0xd586e7f844cea2f87f50152665bcbc2c279d8d70");
    sdk.util.sumSingleBalance(balances, "avax:0xd586e7f844cea2f87f50152665bcbc2c279d8d70", BigNumber(balances["avax:0x4c9993c7107495020c2ce9a13d11839f48ecd2e6"]).times(ratio).toFixed(0));
    delete balances["avax:0x4c9993c7107495020c2ce9a13d11839f48ecd2e6"];
    return balances;
}

module.exports = {
    misrepresentedTokens: true,
    fantom: {
        tvl: ftmTvl,
        staking: stakingUnknownPricedLP(ftmStaking, ftmToken, "fantom", "0x78b51a1fd7524186982c2cb8982df312b1e896a8")
    },
    avalanche: {
        tvl: avaxTvl,
        staking: stakingUnknownPricedLP(avaxStaking, avaxToken, "avax", "0x26e7c9b2890440866d7d3f8f84b1ccaff443b9d8")
    }
}
