const yBTC = "0xba3e932310cd1dbf5bd13079bd3d6bae4570886f"

//BASIS TRADING, BTC COLLECTOR WALLET IS bc1qmus43e5gascs00t7jsf02k7gllhc5antew6n5y
module.exports = {
    arbitrum: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: yBTC })
            api.add(yBTC, supply)
        },
    }
}