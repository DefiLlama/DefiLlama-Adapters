const utils = require('../helper/utils')
const BigNumber = require('bignumber.js')

const currentPoolEndpoint = 'https://avax.prosper.so/api/actualPool?chainId=43114&asset=AVAX%2FUSD&duration=60&token=AVAX'
const avaxCoingeckoId = 'avalanche-2'

async function tvl(timestamp, block) {
    const currentPool = await utils.fetchURL(currentPoolEndpoint)
    const tvl = BigNumber(currentPool.data.bearsQuote).plus(currentPool.data.bullsQuote).div(1e18)

    return {
        [avaxCoingeckoId]: tvl.toNumber()
    }
}

module.exports = {
    avalanche: {
        tvl,
    },
    tvl
}