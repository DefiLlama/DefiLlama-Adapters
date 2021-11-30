const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const token = "0xbcb24AFb019BE7E93EA9C43B7E22Bb55D5B7f45D"
const stakingPools = [
    // START POOLS
    "0x5a42e0B986Af9756d47C263e9b4A54e3958C19dc",
    "0xC8eEeDa5b6F758208abA89bb3d614Ea135c4f29f",
    "0x97c68E1DD1d344926fc2Ef409b0848BFea7C8e8B",
    "0xb86AC944bEECaB78d7ab49cA71b27d25363E6251",
    "0x9534C17Deb29C4999a2B476B8e5ff5De4F326df8",
    "0x9Cec597abAD7f62726BDF02627C1d55B78795d61",
    "0x2cdEc23D9a583fE428E798335F0E92B12527A3a4",
    "0xCE13F6F3b27A15E5d3D641A84813Fc33D98257f2",
    // IDO POOLS
    "0x9d1933c1B85Ff8BCdE9FEbbC0562f7342D0b42D6",
    "0xaeFA83C71D87551c99546DfB7dB5F713ddcd4E28",
    "0x79d5529976252f2579a21c3cB046001f5fb99333"
];

const startPools = [
    "0xA4Cac7BD6F7cEa85a20943eB20B690dc807eD421",
    "0x2f66931d8aa91058B1FCC4Fa38F408dF7dbC56ED",
    "0x9321838064eE23a5e81d8B832eDA8a56435d0C67",
    "0x7A0b27A6f5EBAC48727FE8458E6cA787323F22e2",
    "0x9685ecB565a3305F9f0df5d26A319A7d5aB710Ad",
    "0xfF3790BE5f065C82c688129a41aF84D3A61a37Fd",
    "0x5F352530a5A93ADDfF95a7C4117c92ebc9198aa4",
    "0x1cb255CFb0E6273c2554F1Ca1Cb3C3B37b2CE554",
    "0xAB13600B0237C73eb30C931B93aDE5B1699321d6"
];

const poolTokens = [
    // FARMS
    "0x1d80B4d9afC9472Fc379aDc0fFcEDF32483EDe49",
    "0x3cFedE1dC2134a53383A435d197ED34dB741936c",
    "0x7584A86e9525d9e45daCa7Dd72A9B6f2BF4889e5",
    "0xE40Dd1BF7c0C57d9fe7E2D67E9D8F8e1a5EA291D",
    "0x7b1f753753bd187D08107B312A3991Ee9599B674",
    "0x2a4D0eb224769BCD1468769eAC372E9B5166F0B2",
    "0xdeBbe71d94E4E2b2AAd016D9a3bF8018ACD3F5Ad",
    "0x53F6d4eb57d9ab4BAa623bf1BEd641295DE1B606",
    // IDO
    "0x4CCc37AE6BAAf1Af67899cF8cf0c809Af31d7e7c",
    "0xA4D8348d574FCe65A46b34Efce5952b6158c1787"
];

async function tvl(timestamp, block, chainBlocks) {
    let balances = {}

    let startPoolUnderlying = (await sdk.api.abi.multiCall({
        calls: startPools.map(p => ({
            target: p
        })),
        abi: abi.stakedToken,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;

    let startPoolBalances = (await sdk.api.abi.multiCall({
        calls: startPoolUnderlying.map(p => ({
            target: p.output,
            params: p.input.target
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;

    startPoolBalances.forEach(e => {
        sdk.util.sumSingleBalance(balances, `bsc:${e.input.target}`, e.output);
    });

    let lpUnderlying = (await sdk.api.abi.multiCall({
        calls: poolTokens.map(p => ({
            target: p
        })),
        abi: abi.stakedToken,
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;

    let lpBalances = (await sdk.api.abi.multiCall({
        calls: lpUnderlying.map(p => ({
            target: p.output,
            params: p.input.target
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;

    let lpPositions = [];
    for (let i in lpBalances) {
        lpPositions.push({
            balance: lpBalances[i].output,
            token: lpBalances[i].input.target
        });
    }

    await unwrapUniswapLPs(balances, lpPositions, chainBlocks.bsc, "bsc", addr=>`bsc:${addr}`);
    return balances;
}

async function staking(timestamp, block, chainBlocks) {
    let balances = {};

    let tokenBalance = (await sdk.api.abi.multiCall({
        calls: stakingPools.map(p => ({
            target: token,
            params: p
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks.bsc,
        chain: "bsc"
    })).output;

    tokenBalance.forEach(e => {
        sdk.util.sumSingleBalance(balances, `bsc:${token}`, e.output);
    });
    
    return balances;
}


module.exports = {
    bsc: {
        tvl,
        staking
    },
    tvl
}