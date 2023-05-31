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


module.exports = {
    methodology: 'Value of user supplied asset on zkLend is considered as TVL',
    starknet: {
        fetch
    },
    fetch
}
