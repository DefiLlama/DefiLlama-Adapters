const yBTC = {
    arbitrum: "0xba3e932310cd1dbf5bd13079bd3d6bae4570886f",
    base: "0xB7EcE25d412210499C35A9525FF01553E39A2927",
};

//BASIS TRADING, BTC COLLECTOR WALLET IS bc1qmus43e5gascs00t7jsf02k7gllhc5antew6n5y
module.exports = {
    arbitrum: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: yBTC.arbitrum })
            api.add(yBTC.arbitrum, supply)
        },
    },
    base: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: yBTC.base })
            api.add(yBTC.base, supply)
        },
    }
}