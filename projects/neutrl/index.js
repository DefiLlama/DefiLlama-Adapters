const NUSD = "0xE556ABa6fe6036275Ec1f87eda296BE72C811BCE"

module.exports = {
    ethereum: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: NUSD })
            api.add(NUSD, supply)
        },
    }
}