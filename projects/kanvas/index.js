const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const token0Abi = require("../helper/abis/token0.json");
const token1Abi = require("../helper/abis/token1.json");
const {unwrapUniswapLPs} = require("../helper/unwrapLPs");
const {staking} = require("../helper/staking");
const BigNumber = require("bignumber.js");

const kanvas = "0xe005097ad7eea379ce404011eef68359b052cd0a";
const stakingAddress = "0x34d2Cfb257cCf7EFDC41DB9a824ac314da80Bae8";
const artStudio = "0xf15Bf479A5711f9411595C6289a9e7C36F24ad2F";

const transform = {
"0x150410ebbccc3be87997462ea7a44449b7c0dbf2":"kava:0x765277EebeCA2e31912C9946eAe1021199B39C61" 
}

async function calcTvl(block, chain, pool2) {
    let balances = {};
    const tokenList = (await sdk.api.abi.call({
        target: artStudio, 
        abi: abi.tokenList,
        block,
        chain
    })).output;
    const tokenBalances = (await sdk.api.abi.multiCall({
        calls: tokenList.map(p => ({
            target: artStudio,
            params: p
        })),
        abi: abi.tokenParameters,
        block,
        chain
    })).output;
    const symbols = (await sdk.api.abi.multiCall({
        calls: tokenList.map(p => ({
            target: p
        })),
        abi: "erc20:symbol",
        block,
        chain
    })).output;
    const token0Address = (await sdk.api.abi.multiCall({
        calls: tokenList.map(p => ({
            target: p,
        })),
        abi: token0Abi,
        block,
        chain
    })).output;
    const token1Address = (await sdk.api.abi.multiCall({
        calls: tokenList.map(p => ({
            target: p,
        })),
        abi: token1Abi,
        block,
        chain
    })).output;
    
    let lpPositions = [];
    for (let i = 0; i < tokenList.length; i++) {
        let token = tokenList[i].toLowerCase();
        let balance = tokenBalances[i].output.totalShares;
        let symbol = symbols[i].output;
        let token0 = token0Address[i].output;
        let token1 = token1Address[i].output;
        if (token === kanvas) continue;
        if (pool2 && !symbol.endsWith("LP")) continue;
        if (!symbol.endsWith("LP")) {
            if (transform[token] !== undefined) {
                token = transform[token];
                sdk.util.sumSingleBalance(balances, token, balance);
                continue;
            }
            sdk.util.sumSingleBalance(balances, `${chain}:${token}`, balance);
            continue;
        }
        token0 = token0.toLowerCase();
        token1 = token1.toLowerCase();
        if (pool2) {
            if (token0 !== kanvas && token1 !== kanvas) continue;
        }
        else if (!pool2) {
            if (token0 === kanvas || token1 === kanvas) continue;
        }
        lpPositions.push({
            token,
            balance
        });
    }
    await unwrapUniswapLPs(balances, lpPositions, block, chain, addr=>{
        addr = addr.toLowerCase();
        if (transform[addr] !== undefined) {
            return transform[addr];
        }
        return `kava:${addr}`;
    })
    return balances;
}

async function tvl(timestamp, block, chainBlocks) {
    return await calcTvl(chainBlocks.kava, "kava", false);
}

async function pool2(timestamp, block, chainBlocks) {
    return await calcTvl(chainBlocks.kava, "kava", true);
}

module.exports = {
    kava:{
        tvl,
        pool2,
        staking: staking(stakingAddress, kanvas, "kava")
    }
}