const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const abi = require('../helper/abis/aave.json');
const { nullAddress } = require('../helper/unwrapLPs');

async function getV1Assets(lendingPoolCore, block, chain) {
    const reserves = (
        await sdk.api.abi.call({
            target: lendingPoolCore,
            abi: abi["getReserves"],
            block,
            chain
        })
    ).output;

    return reserves
}

const ethReplacement = ADDRESSES.GAS_TOKEN_2

async function multiMarketV1TvlBorrowed(balances, lendingPoolCore, block, chain, eth) {
    const reserves = await getV1Assets(lendingPoolCore, block, chain);
    const totalBorrowed = await sdk.api.abi.multiCall({
        block,
        calls: reserves.map((reserve) => ({
            target: lendingPoolCore,
            params: reserve,
        })),
        abi: abi.getReserveTotalBorrows,
        chain
    });
    totalBorrowed.output.forEach(borrowed=>{
        const token = borrowed.input.params[0]
        sdk.util.sumSingleBalance(balances, token === ethReplacement?eth:token, borrowed.output)
    })

    return balances;
}

async function depositMultiMarketV1Tvl(balances, lendingPoolCore, block, chain, eth) {
    const reserves = (await getV1Assets(lendingPoolCore, block, chain)).filter(reserve => reserve.toLowerCase() !== ethReplacement.toLowerCase());

    sdk.util.sumSingleBalance(balances, eth, (await sdk.api.eth.getBalance({ target: lendingPoolCore, block, chain })).output)

    const balanceOfResults = await sdk.api.abi.multiCall({
        block,
        calls: reserves.map((reserve) => ({
            target: reserve,
            params: lendingPoolCore,
        })),
        abi: "erc20:balanceOf",
        chain,
    });

    sdk.util.sumMultiBalanceOf(balances, balanceOfResults, true);

    return balances;
}

function multiMarketV1Tvl(balances, lendingPoolCore, block, borrowed, chain="ethereum", eth = ADDRESSES.null) {
    return (borrowed?multiMarketV1TvlBorrowed:depositMultiMarketV1Tvl)(balances, lendingPoolCore, block, chain, eth)
}

async function singleAssetV1Market(balances, lendingPoolCore, block, borrowed, chain, eth) {
    return multiMarketV1Tvl(balances, lendingPoolCore, block, borrowed, chain, eth);
}

async function uniswapV1Market(balances, uniswapLendingPoolCore, block, borrowed, eth = ADDRESSES.null){
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
            abi: "address:tokenAddress",
            calls: uniswapv1Calls,
            permitFailure: true,
            block
        }),
        sdk.api.eth.getBalances({
            targets: Object.keys(uniswapMarketTvlBalances),
            block
        }),
        sdk.api.abi.multiCall({
            abi: 'erc20:totalSupply',
            calls: uniswapv1Calls,
            permitFailure: true,
            block
        }),
    ])

    const uniswapV1TokenBalance = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: uniswapV1Tokens.output.map(t => ({
            target: t.output,
            params: t.input.target
        })),
        permitFailure: true,
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

module.exports={
    singleAssetV1Market,
    uniswapV1Market
}