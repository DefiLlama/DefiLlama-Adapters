const asCAKE= "0x9817f4c9f968a553ff6caef1a2ef6cf1386f16f7"

module.exports = {
    doublecounted: true,
    bsc: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: asCAKE })
            api.add(asCAKE, supply)
        },
    }
}