module.exports = {
    tron: {
        tvl: async (_, _b, _cb, { api, }) => {
            const supply = await api.call({ abi: "erc20:totalSupply", target: "TThzxNRLrW2Brp9DcTQU8i4Wd9udCWEdZ3" })
            return {
                "0xdac17f958d2ee523a2206206994597c13d831ec7": supply/1e12
            }
        }
    }
}
