const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const abi = require('../helper/abis/aave.json');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');

async function ammMarket(balances, block, borrowed) {
    const lendingPool = "0x7937D4799803FbBe595ed57278Bc4cA21f3bFfCB"
    const reservesList = (await sdk.api.abi.call({
        target: lendingPool,
        abi: abi.getReservesList,
        block
    })).output
    const reservesData = await sdk.api.abi.multiCall({
        abi: abi.getAMMReserveData,
        calls: reservesList.map(r => ({
            target: lendingPool,
            params: r
        })),
        block
    })
    const [balanceOfTokens, symbols] = await Promise.all([
        sdk.api.abi.multiCall({
            abi: "erc20:balanceOf",
            calls: reservesData.output.map((r, idx) => ({
                target: reservesList[idx],
                params: r.output.aTokenAddress
            })),
            block
        }),
        sdk.api.abi.multiCall({
            abi: "erc20:symbol",
            calls: reservesData.output.map((r, idx) => ({
                target: reservesList[idx],
            })),
            block
        }),
    ]);

    if (borrowed) {
        const [supplyStabledebt, supplyVariableDebt] = await Promise.all(["stableDebtTokenAddress", "variableDebtTokenAddress"].map(prop =>
            sdk.api.abi.multiCall({
                abi: "erc20:totalSupply",
                calls: reservesData.output.map((r, idx) => ({
                    target: r.output[prop],
                })),
                block
            })
        ));
        supplyStabledebt.output.map((ssd, i) => {
            balanceOfTokens.output[i].output = BigNumber(ssd.output).plus(supplyVariableDebt.output[i].output).toFixed(0)
        })
    }

    const balancerLps = []
    const uniLps = []
    symbols.output.forEach((symbol, i) => {
        const token = symbol.input.target
        const balance = balanceOfTokens.output[i].output
        if (symbol.output === "BPT") {
            balancerLps.push({
                token,
                balance,
            })
        } else if (symbol.output === "UNI-V2") {
            uniLps.push({
                token,
                balance,
            })
        } else {
            sdk.util.sumSingleBalance(balances, token, balance);
        }
    })

    const balancerTokens = await sdk.api.abi.multiCall({
        abi: abi.getCurrentTokens,
        calls: balancerLps.map(r => ({
            target: r.token,
        })),
        block
    });

    await Promise.all(balancerLps.map(async (bal, idx) => {
        const [amountsOnPair, totalSupply] = await Promise.all([
            sdk.api.abi.multiCall({
                abi: "erc20:balanceOf",
                calls: balancerTokens.output[idx].output.map((r) => ({
                    target: r,
                    params: bal.token
                })),
                block
            }),
            sdk.api.erc20.totalSupply({
                target: bal.token,
                block
            })
        ]);
        balancerTokens.output[idx].output.forEach((token, ydx) => {
            const tokenBalance = BigNumber(amountsOnPair.output[ydx].output).times(bal.balance).div(totalSupply.output)
            sdk.util.sumSingleBalance(balances, token, tokenBalance.toFixed(0))
        })
    }))
    await unwrapUniswapLPs(balances, uniLps, block)
}

module.exports = {
    ammMarket
}