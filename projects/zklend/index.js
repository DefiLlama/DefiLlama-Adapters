const { fetchURL } = require('../helper/utils')
const { BigNumber } = require("bignumber.js");


const endpoint = "https://data.app.zklend.com/pools"

const valueToBigNumber = (amount) => {
    if (amount instanceof BigNumber) {
        return amount;
    }
    return new BigNumber(amount);
}

const normalizeBN = (n, decimals) => {
    return valueToBigNumber(n).shiftedBy(decimals * -1);
}

const getUnderlyingAssets = (token) => {
    return {
        'ETH': '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
        'USDC': '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
        'WBTC': '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac',
        'USDT': '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
        'DAI': '0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3',
    }[token]
}

async function fetch() {
    const markets = await fetchURL(endpoint)
    let tvl = 0;
    markets.data.forEach(market => {
        const tokenPrice = normalizeBN(
            market.price.price,
            market.price.decimals
        );
        const supplyVolume = normalizeBN(
            market.supply_amount,
            market.token.decimals
        ).multipliedBy(tokenPrice);
        tvl += supplyVolume.toNumber()
    })

    return tvl
}

const borrowed = async (_, _1, _2, { api }) => {
    let markets = await fetchURL(endpoint)
    const underlyings = [
        '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac',
        '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
        '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
        '0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3',
        '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8'
    ]
    let data = {}
    markets.data.forEach(market => {
        const borrowVolume = valueToBigNumber(market.debt_amount)
        data[getUnderlyingAssets(market.token.symbol)] = borrowVolume.toNumber()
    })

    let sortedData = [] 
    underlyings.map((underlying) => { sortedData.push(data[underlying]) })
    api.addTokens(underlyings, sortedData)
}

module.exports = {
    methodology: 'Value of user supplied asset on zkLend is considered as TVL',
    starknet: {
        fetch,
        borrowed
    },
    fetch
}
