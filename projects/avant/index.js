const avUSD = "0x24dE8771bC5DdB3362Db529Fc3358F2df3A0E346"

module.exports = {
    avax: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: avUSD })
            api.add(avUSD, supply)
        },
    }
}