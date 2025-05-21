const YUSDeth = '0x4274cD7277C7bb0806Bd5FE84b9aDAE466a8DA0a'
const YUSDbsc = '0xAB3dBcD9B096C3fF76275038bf58eAC10D22C61f'

module.exports = {
    ethereum: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: YUSDeth })
            api.add(YUSDeth, supply)
        },
    },
    bsc: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: YUSDbsc })
            api.add(YUSDbsc, supply)
        },
    },
}
