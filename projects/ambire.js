const utils = require('./helper/utils');
const {fetchChainExports} = require('./helper/exports');

async function fetch(net) {
    const result = (await utils.fetchURL('https://relayer.ambire.com/leaderboard/stats'))
    return result.data && result.data.success && result.data.data[net]
        ? result.data.data[net]
        : result.data && result.data.success && !isNaN(net)
            ? result.data.data.total
            :0
}

const fetchers = {
    ethereum: async () => await fetch('ethereum'),
    polygon: async () => await fetch('polygon'),
    bsc: async () => await fetch('binance-smart-chain'),
    avalanche: async () => await fetch('avalanche'),
    fantom: async () => await fetch('fantom'),
    arbitrum: async () => await fetch('arbitrum'),
    andromeda: async () => await fetch('andromeda')
}

module.exports = {
    timetravel: false,
    fetch,
    'ethereum': {
        fetch: fetchers.ethereum
    },
    'polygon': {
        fetch: fetchers.polygon
    },
    'binance-smart-chain': {
        fetch: fetchers.bsc
    },
    'avalanche': {
        fetch: fetchers.avalanche
    },
    'fantom': {
        fetch: fetchers.fantom
    },
    'arbitrum': {
        fetch: fetchers.arbitrum
    },
    'andromeda': {
        fetch: fetchers.andromeda
    },
    methodology: "Counts liquidity on: Technically Ambire Wallet is not locking users funds. However, we count user funds (tokens) that are kept on Ambire wallets on all 5 supported EVM networks as total value locked."
}