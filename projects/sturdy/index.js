const { request, gql } = require("graphql-request");
const { getTokenPriceCoinGecko } = require("../config/bella/utilities");
const {toUSDTBalances} = require("../helper/balances");

const graphUrl_ftm =
    'https://api.thegraph.com/subgraphs/name/sturdyfi/sturdy-fantom';
const graphUrl_eth =
    'https://api.thegraph.com/subgraphs/name/sturdyfi/sturdy-ethereum';

const graphQuery = gql`
    query get_tvl {
        reserves {
            name
            symbol
            decimals
            price {
                priceInEth
            }
            totalDeposits
            totalLiquidity
            availableLiquidity
        }
    }
`;

const priceInUSD = (value, decimals, price) => {
    return (value / Math.pow(10, decimals) * price / Math.pow(10, 8)).toFixed(2);
}

async function fetch(borrow, chain) {
    const graphUrl = chain == 'fantom' ? graphUrl_ftm : graphUrl_eth;
    const { reserves } = await request(graphUrl, graphQuery);
    let tvl = reserves.reduce((sum, reserve) => {
        const value = borrow ? reserve.availableLiquidity : reserve.totalLiquidity;
        return sum + +priceInUSD(value, reserve.decimals, reserve.price.priceInEth);        
    }, 0);

    if (chain == 'ethereum') {
        const ethPrice = await getTokenPriceCoinGecko("usd")("ethereum");
        tvl = tvl / Math.pow(10, 10) * ethPrice;
    }
    
    return toUSDTBalances(tvl);
}

const borrowed = (chain) => async (_timestamp, _ethBlock, chainBlocks) => {
    return await fetch(true, chain);
}

 const tvl = (chain) => async(_timestamp, _ethBlock, chainBlocks) => {
    return await fetch(false, chain);
}

module.exports = {
    fantom:{
        tvl: tvl('fantom'),
        borrowed: borrowed('fantom'),
    },
    ethereum:{
        tvl: tvl('ethereum'),
        borrowed: borrowed('ethereum'),
    },
};
