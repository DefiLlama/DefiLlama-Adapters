const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const abi = require('../helper/abis/aave.json');

async function getV1Assets(lendingPoolCore, block) {
    const reserves = (
        await sdk.api.abi.call({
            target: lendingPoolCore,
            abi: abi["getReserves"],
            block
        })
    ).output;

    return reserves
}

const ethReplacement = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

async function multiMarketV1TvlBorrowed(balances, lendingPoolCore, block) {
    const reserves = await getV1Assets(lendingPoolCore, block);
    const totalBorrowed = await sdk.api.abi.multiCall({
        block,
        calls: reserves.map((reserve) => ({
            target: lendingPoolCore,
            params: reserve,
        })),
        abi: abi.getReserveTotalBorrows,
    });
    totalBorrowed.output.forEach(borrowed=>{
        const token = borrowed.input.params[0]
        sdk.util.sumSingleBalance(balances, token === ethReplacement?eth:token, borrowed.output)
    })

    return balances;
}

function multiMarketV1Tvl(balances, lendingPoolCore, block, borrowed) {
    return (borrowed?multiMarketV1TvlBorrowed:depositMultiMarketV1Tvl)(balances, lendingPoolCore, block)
}

async function depositMultiMarketV1Tvl(balances, lendingPoolCore, block) {
    const reserves = (await getV1Assets(lendingPoolCore, block)).filter(reserve => reserve !== ethReplacement);

    sdk.util.sumSingleBalance(balances, eth, (await sdk.api.eth.getBalance({ target: lendingPoolCore, block })).output)

    const balanceOfResults = await sdk.api.abi.multiCall({
        block,
        calls: reserves.map((reserve) => ({
            target: reserve,
            params: lendingPoolCore,
        })),
        abi: "erc20:balanceOf",
    });

    sdk.util.sumMultiBalanceOf(balances, balanceOfResults, true);

    return balances;
}

const uniswapLendingPoolCore = "0x1012cfF81A1582ddD0616517eFB97D02c5c17E25";
const eth = "0x0000000000000000000000000000000000000000"

async function uniswapV1Market(balances, block, borrowed){
    const uniswapMarketTvlBalances = {}
    await multiMarketV1Tvl(
        uniswapMarketTvlBalances,
        uniswapLendingPoolCore,
        block,
        borrowed
    );

    const uniswapv1Calls = Object.keys(uniswapMarketTvlBalances).map(t => ({ target: t }));
    const [uniswapV1Tokens, uniswapV1EthBalance, uniswapV1Supplies] = await Promise.all([
        sdk.api.abi.multiCall({
            abi: { "name": "tokenAddress", "outputs": [{ "type": "address", "name": "out" }], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1413 },
            calls: uniswapv1Calls,
            block
        }),
        sdk.api.eth.getBalances({
            targets: Object.keys(uniswapMarketTvlBalances),
            block
        }),
        sdk.api.abi.multiCall({
            abi: 'erc20:totalSupply',
            calls: uniswapv1Calls,
            block
        }),
    ])

    const uniswapV1TokenBalance = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: uniswapV1Tokens.output.map(t => ({
            target: t.output,
            params: t.input.target
        })),
        block
    })

    // ...add v1 uniswap market TVL
    Object.keys(uniswapMarketTvlBalances).forEach((address, idx) => {
        const balance = uniswapMarketTvlBalances[address];
        if (uniswapV1Tokens.output[idx].success === false) {
            sdk.util.sumSingleBalance(balances, address, balance)
        } else {
            const tokenBalance = BigNumber(uniswapV1TokenBalance.output[idx].output).times(balance).div(uniswapV1Supplies.output[idx].output)
            const ethBalance = BigNumber(uniswapV1EthBalance.output[idx].balance).times(balance).div(uniswapV1Supplies.output[idx].output)
            const token = uniswapV1Tokens.output[idx].output
            sdk.util.sumSingleBalance(balances, token, tokenBalance.toFixed(0))
            sdk.util.sumSingleBalance(balances, eth, ethBalance.toFixed(0))
        }
    });

    return balances
}

const aaveLendingPoolCore = "0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3";

async function singleAssetV1Market(balances, block, borrowed) {
    return multiMarketV1Tvl(balances, aaveLendingPoolCore, block, borrowed);
}

module.exports={
    singleAssetV1Market,
    uniswapV1Market
}