const USDe = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"

module.exports = {
    ethereum: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: USDe })
            api.add(USDe, supply)
        },
    }
}
