const asBNB= "0x77734e70b6E88b4d82fE632a168EDf6e700912b6"

module.exports = {
    doublecounted: true,
    bsc: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: asBNB })
            api.add(asBNB, supply)
        },
    }
}