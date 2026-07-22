const BigNumber = require("bignumber.js")
const sdk = require("@defillama/sdk")
const {getCache} = require("../helper/http")

const EXCHANGE_RATE_ADDRESS = "0x7Bbe7FDCd6BdFFd7F767a9531b6210b87b3e46E7"
const XAUT_COINGECKO_ID = "tether-gold"
const XAUT_PRICE_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${XAUT_COINGECKO_ID}&vs_currencies=usd`

const TOKEN_ADDRESS = {
    bsc: "0xe60106a5cAb7e7C64830919d36Ab20CaAf50Ac91",
    base: "0xeA953eA6634d55dAC6697C436B1e81A679Db5882",
    ethereum: "0x77a31A47E8a1dCe18Cb1772ae1C2157Fa080CFde",
}

async function getExchangeRate(api) {
    if (api.chain === 'bsc')
        return api.call({abi: 'uint256:exchangeRate', target: EXCHANGE_RATE_ADDRESS})

    const bscApi = new sdk.ChainApi({chain: 'bsc', timestamp: api.timestamp})
    await bscApi.getBlock()
    return bscApi.call({abi: 'uint256:exchangeRate', target: EXCHANGE_RATE_ADDRESS})
}

async function tvl(api) {
    const [supply, exchangeRate, prices] = await Promise.all([
        api.call({abi: 'erc20:totalSupply', target: TOKEN_ADDRESS[api.chain]}),
        getExchangeRate(api),
        getCache(XAUT_PRICE_URL),
    ])

    const xautPrice = prices[XAUT_COINGECKO_ID].usd
    const tvl = BigNumber(supply).times(exchangeRate).times(xautPrice).div(1e12).toNumber()

    return {
        'usd-coin': tvl
    }
}

module.exports = {
    hallmarks: [
        ['2026-05-19', "unitas-xgld launch"]
    ],
    timetravel: false,
    bsc: {
        tvl
    },
    base: {
        tvl
    },
    ethereum: {
        tvl
    }
}
