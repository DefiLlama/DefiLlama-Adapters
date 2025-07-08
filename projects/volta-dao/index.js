const ADDRESSES = require('../helper/coreAssets.json')
const { stakingUnknownPricedLP } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs');

const ftmToken = "0x4c9993c7107495020c2ce9a13d11839f48ecd2e6";
const ftmStaking = "0xc6a54adddf7463f73a4c5a8e3e480bc798cf8a09";
const ftmTreasury = "0x05ab17e4dfa87ef4ac487ed20cfcc2ae75c2a792";
const ftmTokens = [
    ADDRESSES.fantom.DAI,
    "0x78b51a1fd7524186982c2cb8982df312b1e896a8"
];

const avaxToken = "0x4c9993c7107495020c2ce9a13d11839f48ecd2e6";
const avaxStaking = "0xfae672012b90cfb6bf245ac072a3aca374604b17";
const avaxTreasury = "0x05ab17e4dfa87ef4ac487ed20cfcc2ae75c2a792";
const avaxTokens = [
    ADDRESSES.avax.DAI,
    "0x26e7c9b2890440866d7d3f8f84b1ccaff443b9d8"
]

async function ftmTvl(api) {
    return sumTokens2({ api, owner: ftmTreasury, tokens: ftmTokens, resolveLP: true })
}

async function avaxTvl(api) {
    return sumTokens2({ api, owner: avaxTreasury, tokens: avaxTokens, resolveLP: true })
}

module.exports = {
    misrepresentedTokens: true,
    fantom: {
        tvl: ftmTvl,
        staking: stakingUnknownPricedLP(ftmStaking, ftmToken, "fantom", "0x78b51a1fd7524186982c2cb8982df312b1e896a8")
    },
    avax: {
        tvl: avaxTvl,
        staking: stakingUnknownPricedLP(avaxStaking, avaxToken, "avax", "0x26e7c9b2890440866d7d3f8f84b1ccaff443b9d8")
    }
}
