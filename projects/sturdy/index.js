const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

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
            pool { id }
            price { priceInEth }
            borrowingEnabled
            totalDeposits
            totalLiquidity
            availableLiquidity
            totalCurrentVariableDebt
            totalUnderlyingAssetAmount
            liquidityIndex
            underlyingAsset
        }
        usdPriceEth: priceOracle(id: "1") {
            usdPriceEth
        }
    }
`;

const priceInUSD = (value, decimals, price) => {
    return (value / Math.pow(10, decimals) * price / Math.pow(10, 8)).toFixed(2);
}

const getReservePrice = async (reserve) => {
    let oracle_address;
    if (reserve.pool.id == '0x40ea6e14800f6040d25a9a5a1e9cc0f5cb6d1066') { // ethereum eth market
        oracle_address = '0xe5d78eB340627B8D5bcFf63590Ebec1EF9118C89';
    } else if (reserve.pool.id == '0xb7499a92fc36e9053a4324affae59d333635d9c3') { // ethereum stable market
        oracle_address = '0x116529C8E3897257762e8fFdD8c0184978f33150';
    } else {
        console.log('error', reserve.pool.id)
        return 0;
    }
    
    const asset = reserve.underlyingAsset;
    const asset_price = (
        await sdk.api.abi.call({
            target: oracle_address,
            params: asset,
            //   abi: ["function getAssetPrice(address) view returns (uint256)"],
            abi:
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    }
                ],
                "name": "getAssetPrice",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            chain: 'ethereum',
        })
    ).output;
    console.log(reserve.symbol, asset_price)
    return +asset_price
};

async function fetch(borrow, chain) {
    const graphUrl = chain == 'fantom' ? graphUrl_ftm : graphUrl_eth;
    const { reserves, usdPriceEth } = await request(graphUrl, graphQuery);
    let tvl = 0;
    for (let i = 0; i < reserves.length; i++) {
        const reserve = reserves[i];
        let value = +reserve.totalLiquidity
        if (borrow)  {
            value = +reserve.totalCurrentVariableDebt;
        } else if (chain == 'fantom' && reserve.borrowingEnabled) {
            value = +reserve.totalUnderlyingAssetAmount/ 10 ** 18 * +reserve.liquidityIndex / 10 ** 9;
        }
        let reserve_price = reserve.price.priceInEth;
        if (chain == 'ethereum') {
            reserve_price = await getReservePrice(reserve);
        }
        tvl += +priceInUSD(value, reserve.decimals, reserve_price);        
    }

    if (chain != 'ethereum')
        return toUSDTBalances(tvl);

    const ethPrice = Math.pow(10, 18) / usdPriceEth.usdPriceEth;
    tvl = tvl / Math.pow(10, 10) * ethPrice;
    return toUSDTBalances(tvl);
}

const borrowed = (chain) => async (_timestamp, _ethBlock, chainBlocks) => {
    return await fetch(true, chain);
}

const tvl = (chain) => async (_timestamp, _ethBlock, chainBlocks) => {
    return await fetch(false, chain);
}

module.exports = {
    fantom: {
        tvl: tvl('fantom'),
        borrowed: borrowed('fantom'),
    },
    ethereum: {
        tvl: tvl('ethereum'),
        borrowed: borrowed('ethereum'),
    },
};