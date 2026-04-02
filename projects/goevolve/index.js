const eusd = {
    sei: "0xf2282e641cd3ceeafd4e24663d409fcb68edc1df",
}

module.exports['sei'] = {
        tvl: async (api) => {
            const calls = [
                eusd['sei'],
            ].filter(Boolean)
            const supply = await api.multiCall({ calls, abi: 'erc20:totalSupply' })
            console.log(supply)
            api.add(calls, supply);
        }
    }