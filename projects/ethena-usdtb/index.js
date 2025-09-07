const USDtb = "0xc139190f447e929f090edeb554d95abb8b18ac1c"

module.exports = {
    doublecounted: true,
    ethereum: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: USDtb })
            api.add(USDtb, supply)
        },
    }
}
