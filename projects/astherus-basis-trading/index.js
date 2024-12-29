const USDF = "0x5A110fC00474038f6c02E89C707D638602EA44B5"

module.exports = {
    bsc: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: USDF })
            api.add(USDF, supply)
        },
    }
}