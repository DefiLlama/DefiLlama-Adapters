const axios = require('axios');
const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

async function suiTvl(api) {
    const pools = (await axios.get('https://swap.api.sui-prod.bluefin.io/api/v1/pools/info')).data;
    let tokenAddresses={};
    for (const pool of pools) {
        tokenAddresses[pool.tokenA.info.address] = {
            decimals: pool.tokenA.info.decimals
        };
        tokenAddresses[pool.tokenB.info.address] = {
            decimals: pool.tokenB.info.decimals
        };
    }

    const addresses = Object.keys(tokenAddresses);

    const tokenPriceQuery = addresses.join(',');
    const tokenPrices = (await axios.get(`https://swap.api.sui-prod.bluefin.io/api/v1/tokens/price?tokens=${tokenPriceQuery}`)).data;
    tokenPrices.map(token => {
        tokenAddresses[token.address].price = token.price;
    });

    let tvl = 0;
    for (const pool of pools) {
        const tokenA = pool.tokenA.info.address;
        const tokenB = pool.tokenB.info.address;
        const onChainPoolObject = await sui.getObject(pool.address);
        const poolTokenAAmount = onChainPoolObject.fields.coin_a;
        const poolTokenBAmount = onChainPoolObject.fields.coin_b;

        const tokenAValue = (Number(poolTokenAAmount) / 10 ** tokenAddresses[tokenA].decimals) * (Number(tokenAddresses[tokenA].price) || 0);
        const tokenBValue = (Number(poolTokenBAmount) / 10 ** tokenAddresses[tokenB].decimals) * (Number(tokenAddresses[tokenB].price) || 0);
        tvl += tokenAValue + tokenBValue
    }
    api.add(ADDRESSES.sui.USDC, tvl * 1e6);
    return api.getBalances();
}


module.exports = {
    sui: {
        tvl: suiTvl
    },
}