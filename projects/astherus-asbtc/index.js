const asBTC = "0x184b72289c0992bdf96751354680985a7c4825d6"

module.exports = {
    bsc: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: asBTC })
            api.add(asBTC, supply)
        },
    }
}