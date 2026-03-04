const USDF = "0xFa2B947eEc368f42195f24F36d2aF29f7c24CeC2";

module.exports = {
    ethereum: {
        tvl: async (api) => api.add(USDF, await api.call({ target: USDF, abi: 'erc20:totalSupply' })),
    }
}