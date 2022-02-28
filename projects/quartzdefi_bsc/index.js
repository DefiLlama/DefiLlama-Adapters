const sdk = require("@defillama/sdk");
const { transformBscAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { pool2Exports } = require("../helper/pool2");
const { staking } = require("../helper/staking");

const ashareTokenAddress = "0xFa4b16b0f63F5A6D0651592620D585D308F749A4";

const LPTokens = [
    "0x6f78a0d31adc7c9fb848850f9d2a40da5858ad03",
    "0x39846550Ef3Cb8d06E3CFF52845dF42F71Ac3851",
    "0x61503f74189074e8e793cc0827eae37798c2b8f7"
]

const aShareBoardroomAddress = "0xC183b26Ad8C660AFa7B388067Fd18c1Fb28f1bB4";

const ashareRewardPool = "0x1da194F8baf85175519D92322a06b46A2638A530";


async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    let lpPositions = [];
    let transformAddress = await transformBscAddress();

    // Quartz.defi Boardroom TVL
    const boardroomBalance = sdk.api.erc20
        .balanceOf({
            target: ashareTokenAddress,
            owner: aShareBoardroomAddress,
            block: chainBlocks["bsc"],
            chain: "bsc",
        });
    sdk.util.sumSingleBalance(
        balances,
        transformAddress(ashareTokenAddress),
        (await boardroomBalance).output
    );

    // // Farms
    const amesUSTFarmBalance = sdk.api.erc20
        .balanceOf({
            target: LPTokens[0],
            owner: ashareRewardPool,
            block: chainBlocks["bsc"],
            chain: "bsc",
        });

    lpPositions.push({
        token: LPTokens[0],
        balance: (await amesUSTFarmBalance).output,
    });

    const ashareUSTBalance = sdk.api.erc20
        .balanceOf({
            target: LPTokens[1],
            owner: ashareRewardPool,
            block: chainBlocks["bsc"],
            chain: "bsc",
        });

    lpPositions.push({
        token: LPTokens[1],
        balance: (await ashareUSTBalance).output,
    });

    const qshareUSTBalance = sdk.api.erc20
        .balanceOf({
            target: LPTokens[2],
            owner: ashareRewardPool,
            block: chainBlocks["bsc"],
            chain: "bsc",
        });

    lpPositions.push({
        token: LPTokens[2],
        balance: (await qshareUSTBalance).output,
    });

    await unwrapUniswapLPs(
        balances,
        lpPositions,
        chainBlocks["bsc"],
        "bsc",
        transformAddress
    );

    return balances;
}

module.exports = {
    methodology: 'The TVL of Quartz.Defi is calculated using the Pancake LP token deposits (AMES/UST, ASHARE/UST, 1QSHARE/UST) in the farms, and the ASHARE deposits found in the Boardroom.',
    bsc: {
        tvl,
        pool2: pool2Exports(ashareRewardPool, LPTokens, "bsc"),
        staking: staking(aShareBoardroomAddress, ashareTokenAddress, "bsc"),
    },
};