const { pool2Exports } = require("../helper/pool2");
const { staking } = require("../helper/staking");
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

// BSC ADDRESSES
const ashareTokenAddress = "0xFa4b16b0f63F5A6D0651592620D585D308F749A4";
const ames = "0xb9e05b4c168b56f73940980ae6ef366354357009";
const BSCLPTokens = [
    "0x6f78a0d31adc7c9fb848850f9d2a40da5858ad03",
    "0x39846550Ef3Cb8d06E3CFF52845dF42F71Ac3851",
    "0x61503f74189074e8e793cc0827eae37798c2b8f7"
]
const aShareBoardroomAddress = "0xC183b26Ad8C660AFa7B388067Fd18c1Fb28f1bB4";
const ashareRewardPool = "0x1da194F8baf85175519D92322a06b46A2638A530";

// HARMONY ADDRESSES
const quartz = "0xb9E05B4C168B56F73940980aE6EF366354357009";
const qshare = "0xFa4b16b0f63F5A6D0651592620D585D308F749A4";
const xquartz = "0xCa1dd590C3ceBa9F57E05540B91AB3F0Ed08580a";
const singleQuartzFarm = "0x1da194F8baf85175519D92322a06b46A2638A530";

const qshareRewardPool = "0x1da194f8baf85175519d92322a06b46a2638a530";
const qshareboardroom = "0xe1e48d3476027af9dc92542b3a60f2d45a36e082";

const HarmonyLPTokens = [
    "0x3736b5b6f2033433ea974e121ce19cc6d0e10dc9",
    "0x157e2e205b8d307501f1aad1c5c96c562e6f07c5",
    "0x90a48cb3a724ef6f8e6240f4788559f6370b6925"
]

async function harmonyPool2(timestamp, block, chainBlocks) {
    let balances = {};
    const chain = "harmony";
    block = chainBlocks.harmony;
    const balance = (await sdk.api.abi.multiCall({
        calls: HarmonyLPTokens.map(p => ({
            target: p,
            params: qshareRewardPool
        })),
        abi: "erc20:balanceOf",
        block,
        chain
    })).output;

    let lpPositions = [];

    balance.forEach(p => {
        lpPositions.push({
            token: p.input.target,
            balance: p.output
        });
    });

    await unwrapUniswapLPs(balances, lpPositions, block, chain, addr=>{
        return `harmony:${addr}`;
    });

    return balances;
}

async function harmonyStaking(timestamp, block, chainBlocks) {
    let balances = {};
    const chain = "harmony";
    block = chainBlocks.harmony;

    const tokenBalances = (await sdk.api.abi.multiCall({
        calls: [
            {
                target: qshare,
                params: qshareboardroom
            },
            {
                target: quartz,
                params: singleQuartzFarm
            },
            {
                target: quartz,
                params: xquartz
            }
        ],
        abi: "erc20:balanceOf",
        block,
        chain
    })).output;

    tokenBalances.forEach(p => {
        sdk.util.sumSingleBalance(balances, `harmony:${p.input.target}`, p.output);
    })

    return balances;
}

module.exports = {
    misrepresentedTokens: true,
    harmony: {
        tvl: async () => ({}),
        staking: harmonyStaking,
        pool2: harmonyPool2
    },
    bsc: {
        tvl: async () => ({}),
        staking: staking(aShareBoardroomAddress, ashareTokenAddress),
        pool2: pool2Exports(ashareRewardPool, BSCLPTokens, "bsc", addr=> {
            addr = addr.toLowerCase();
            if (addr === "0x36d53ed6380313f3823eed2f44dddb6d1d52f656") {
                return "harmony:0xfa4b16b0f63f5a6d0651592620d585d308f749a4"
            }
            return `bsc:${addr}`;
        })
    }
}