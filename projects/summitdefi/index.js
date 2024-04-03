const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const abi = require("./abi.json");
const { BigNumber } = require("bignumber.js");

const summit = "0x0ddb88e14494546d07fcd94c3f0ef6d3296b1cd7";
const everest = "0xc687806cfd11b5330d7c3ae6f18b18dc71e1083e";
const cartoasis = "0x8047c5bed363fe1bf458ec3e20e93a3c28a07b8d";
const cartplains = "0x1805922e7f82fc9dbad8e2435c146ba605c4a25d";
const cartmesa = "0x64f8a1dbc20f132159605ad8d7111e75ea702358";
const cartsummit = "0x93af6a3882aaf4112fc404e30277b39452f44cf6";

const beethovenAddresses = [
    "0xcde5a11a4acb4ee4c805352cec57e236bdbc3837",
    "0xd47d2791d3b46f9452709fa41855a045304d6f9d",
    "0xcdf68a4d525ba2e90fe959c74330430a5a6b8226",
    "0x9af1f0e9ac9c844a4a4439d446c1437807183075"
]

async function getCarttvl(balances, block, cart) {
    const chain = "fantom";
    cart = cart.toLowerCase();

    const getPools = (await sdk.api.abi.call({
        target: cart,
        abi: abi["getPools"],
        block,
        chain
    })).output;
    
    const symbols = (await sdk.api.abi.multiCall({
        calls: getPools.map(p => ({
            target: p
        })),
        abi: "erc20:symbol",
        block,
        chain
    })).output;

    const poolSupply = (await sdk.api.abi.multiCall({
        calls: getPools.map(p => ({
            target: cart,
            params: p
        })),
        abi: abi["supply"],
        block,
        chain
    })).output;

    let lps = [];
    let beethovenBals = [];

    for (let i = 0; i < getPools.length; i++) {
        const token = getPools[i].toLowerCase();
        const symbol = symbols[i].output;
        const balance = poolSupply[i].output;
        if (token === summit || token === everest) continue;
        if (beethovenAddresses.includes(token)) {
            beethovenBals.push(balance);
            continue;
        }
        if (symbol.endsWith("LP")) {
            lps.push({
                token,
                balance
            });
            continue;
        }
        sdk.util.sumSingleBalance(balances, `fantom:${token}`, balance);
    }

    await unwrapUniswapLPs(balances, lps, block, chain, addr=>`fantom:${addr}`);

    const beetTotalSupply = (await sdk.api.abi.multiCall({
        calls: beethovenAddresses.map(p => ({
            target: p
        })),
        abi: "erc20:totalSupply",
        block,
        chain
    })).output;

    const beetVaults = (await sdk.api.abi.multiCall({
        calls: beethovenAddresses.map(p => ({
            target: p
        })),
        abi: abi["getVault"],
        block,
        chain
    })).output;

    const beetIds = (await sdk.api.abi.multiCall({
        calls: beethovenAddresses.map(p => ({
            target:p
        })),
        abi: abi["getPoolId"],
        block,
        chain
    })).output;

    let poolTokenCall = [];
    for (let i = 0; i < beetVaults.length; i++) {
        poolTokenCall.push({
            target: beetVaults[i].output,
            params: beetIds[i].output
        });
    }

    const beetPoolTokens = (await sdk.api.abi.multiCall({
        calls: poolTokenCall,
        abi: abi["getPoolTokens"],
        block,
        chain
    })).output;

    for (let i = 0; i < beetPoolTokens.length; i++) {
        const tokens = beetPoolTokens[i].output.tokens;
        const bals = beetPoolTokens[i].output.balances;
        const ratio = Number(beethovenBals[i]) / beetTotalSupply[i].output;
        for (let j = 0; j < tokens.length; j++) {
            sdk.util.sumSingleBalance(balances, `fantom:${tokens[j]}`, BigNumber(bals[j]).times(ratio).toFixed(0));
        }
    }
}

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};
    block = chainBlocks.fantom;
    await getCarttvl(balances, block, cartoasis);
    await getCarttvl(balances, block, cartplains);
    await getCarttvl(balances, block, cartmesa);
    await getCarttvl(balances, block, cartsummit);
    return balances;
}

async function staking(timestamp, block, chainBlocks) {
    let balances = {};
    block = chainBlocks.fantom;
    const chain = "fantom";
    const getPoolTokens = (await sdk.api.abi.call({
        target: "0x20dd72ed959b6147912c2e529f0a0c651c33c9ce",
        params: "0x1577eb091d3933a89be62130484e090bb8bd0e5800010000000000000000020f",
        abi: abi["getPoolTokens"],
        block,
        chain
    })).output;
    const valueOfSummitInUSDCInPool = (Number(getPoolTokens.balances[0]) * 3) * 1e12;
    const summitValueInUSDC = valueOfSummitInUSDCInPool/ Number(getPoolTokens.balances[1]);
    const summitInEverest = (await sdk.api.erc20.balanceOf({
        target: summit,
        owner: everest,
        block,
        chain
    })).output;
    sdk.util.sumSingleBalance(balances, "fantom:" + ADDRESSES.fantom.DAI, BigNumber(summitInEverest).times(summitValueInUSDC).toFixed(0));
    return balances;
}

module.exports = {
    methodology: "TVL is from deposits into the cartographer contracts. Staking TVL is from SUMMIT deposited into EVEREST contract",
    fantom: {
        misrepresentedTokens: true,
        tvl,
        staking
    }
}