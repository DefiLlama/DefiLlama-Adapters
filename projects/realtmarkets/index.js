const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const registry = "0x5B8D36De471880Ee21936f328AAB2383a280CB2A";

async function tvl (timestamp, block, chainBlocks) {
    let balances = {};
    const chain = "xdai";
    block = chainBlocks.xdai;

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
        sdk.util.sumSingleBalance(balances, `xdai:${p.input.target}`, p.output);
    })

    return balances;
}

async function borrowed (timestamp, block, chainBlocks) {
    let balances = {};
    const chain = "xdai";
    block = chainBlocks.xdai;

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
        sdk.util.sumSingleBalance(balances, `xdai:${reserveList[i]}`, debtTokenSupply[i].output);
    } 

    return balances;
}

module.exports = {
    xdai: {
        tvl,
        borrowed
    }
}