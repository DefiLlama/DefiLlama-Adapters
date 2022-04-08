const { fetchURL } = require('../helper/utils')
const { toUSDTBalances } = require('../helper/balances')

const chainIds = {
    ethereum: 1,
    xdai: 100,
    polygon: 137,
    gochain: 60,
    bsc: 56,
    tomochain: 88,
    fantom: 250,
    avalanche: 43114,
    moonriver: 1285,
    celo: 42220,
    songbird: 19,
    harmony: 1666600000,
    ethereumclassic: 61,
    heco: 128,
    rsk: 30,
    okexchain: 66,
    hpb: 269,
    energyweb: 246,
    kcc: 321,
    arbitrum: 42161,
    smartbch: 10000,
}

function chainTvl(chain) {
    return async () => {
        const data = await fetchURL(`https://swap.cat/api/?tvl=${chainIds[chain]}`)
        return toUSDTBalances(data.data)
    }
}

const tvls = Object.keys(chainIds).reduce((obj, chain) => ({
        ...obj,
        [chain]: {
            offers: chainTvl(chain)
        }
    }), {})
tvls.ethereumclassic.tvl = async () => ({});

module.exports = {
    timetravel: false,
    misrepresentedTokens:true,
    ...tvls,
}
