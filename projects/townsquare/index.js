const chains = ['xlayer', 'base', 'robinhood', 'monad', 'arbitrum', 'bsc', 'ethereum']

module.exports = {
    methodology: "townsquare TVL is the sum of tokens committed in townsquare private credits",
}

chains.forEach(chain => {
    module.exports[chain] = { tvl: () => ({}) }
})
