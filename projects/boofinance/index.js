const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const token0Abi = require("../helper/abis/token0.json");
const token1Abi = require("../helper/abis/token1.json");
const {unwrapUniswapLPs} = require("../helper/unwrapLPs");
const {staking} = require("../helper/staking");
const BigNumber = require("bignumber.js");

const boofi = "0xb00f1ad977a949a3ccc389ca1d1282a2946963b0";
const stakingAddress = "0x67712c62d1DEAEbDeF7401E59a9E34422e2Ea87c";
const hauntedHouse = "0xB178bD23876Dd9f8aA60E7FdB0A2209Fe2D7a9AB";

const transform = {
    "0x4f60a160d8c2dddaafe16fcc57566db84d674bd6":"harmony:0x72cb10c6bfa5624dd07ef608027e366bd690048f",
    "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e":"avax:0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664"
}

const joe = "0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd";
const xjoe = "0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33";

async function calcTvl(block, chain, pool2) {
    let balances = {};
    const tokenList = (await sdk.api.abi.call({
        target: hauntedHouse, 
        abi: abi.tokenList,
        block,
        chain
    })).output;
    const tokenBalances = (await sdk.api.abi.multiCall({
        calls: tokenList.map(p => ({
            target: hauntedHouse,
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
        if (token === boofi) continue;
        if (pool2 && !symbol.endsWith("LP") && !symbol.endsWith("PGL")) continue;
        if (!symbol.endsWith("LP") && !symbol.endsWith("PGL")) {
            if (token === xjoe) {
                const joeBalance = (await sdk.api.erc20.balanceOf({
                    target: joe,
                    owner: xjoe,
                    block,
                    chain
                })).output;
                const xJoeSupply = (await sdk.api.erc20.totalSupply({
                    target: xjoe,
                    block,
                    chain
                })).output;
                sdk.util.sumSingleBalance(balances, `avax:${joe}`, BigNumber(balance).times(joeBalance/xJoeSupply).toFixed(0));
                continue;
            }
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
            if (token0 !== boofi && token1 !== boofi) continue;
        }
        else if (!pool2) {
            if (token0 === boofi || token1 === boofi) continue;
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
        return `avax:${addr}`;
    })
    return balances;
}

async function tvl(timestamp, block, chainBlocks) {
    return await calcTvl(chainBlocks.avax, "avax", false);
}

async function pool2(timestamp, block, chainBlocks) {
    return await calcTvl(chainBlocks.avax, "avax", true);
}

module.exports = {
    avalanche: {
        tvl,
        pool2,
        staking: staking(stakingAddress, boofi, "avax")
    }
}