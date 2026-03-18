const eusd = {
    sei: "0xf2282e641cd3ceeafd4e24663d409fcb68edc1df",
}

const l2Chains = Object.keys(eusd).filter(chain => chain !== 'ethereum')

l2Chains.forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            const calls = [
                eusd[chain],
            ].filter(Boolean)
            const supply = await api.multiCall({ calls, abi: 'erc20:totalSupply' })
            api.addTokens(calls, supply, {
                name: 'eUSD',
                symbol: 'eUSD',
                decimals: 18,
                chain: chain,
                address: eusd[chain],
            });
        }
    }
});