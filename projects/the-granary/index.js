const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const registry = "0x7220FFD5Dc173BA3717E47033a01d870f06E5284";

async function tvl (timestamp, block, chainBlocks) {
    let balances = {};
    const chain = "fantom";
    block = chainBlocks.fantom;

    const reserveList = (await sdk.api.abi.call({
        target: registry,
        abi: abi.getReservesList,
        block,
        chain
    })).output;

    const reserveDatas = (await sdk.api.abi.multiCall({
        calls: reserveList.map(p => ({
            target: registry,
            params: p
        })),
        abi: abi.getReserveData,
        block,
        chain
    })).output;

    const collateralBalances = (await sdk.api.abi.multiCall({
        calls: reserveDatas.map(p => ({
            target: p.input.params[0],
            params: p.output.aTokenAddress
        })),
        abi: "erc20:balanceOf",
        block,
        chain
    })).output;

    collateralBalances.forEach(p => {
        sdk.util.sumSingleBalance(balances, `fantom:${p.input.target}`, p.output);
    })

    return balances;
}

async function borrowed (timestamp, block, chainBlocks) {
    let balances = {};
    const chain = "fantom";
    block = chainBlocks.fantom;

    const reserveList = (await sdk.api.abi.call({
        target: registry,
        abi: abi.getReservesList,
        block,
        chain
    })).output;

    const reserveDatas = (await sdk.api.abi.multiCall({
        calls: reserveList.map(p => ({
            target: registry,
            params: p
        })),
        abi: abi.getReserveData,
        block,
        chain
    })).output;

    const debtTokenSupply = (await sdk.api.abi.multiCall({
        calls: reserveDatas.map(p => ({
            target: p.output.variableDebtTokenAddress
        })),
        abi: "erc20:totalSupply",
        block,
        chain
    })).output;
    
    for (let i = 0; i < debtTokenSupply.length; i++) {
        sdk.util.sumSingleBalance(balances, `fantom:${reserveList[i]}`, debtTokenSupply[i].output);
    } 

    return balances;
}

module.exports = {
    fantom: {
        tvl,
        borrowed
    }
}