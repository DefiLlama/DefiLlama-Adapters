const yzUSD = '0x6695c0f8706c5ace3bdf8995073179cca47926dc';

module.exports = {
    plasma: {
        tvl: async (api) => {
            const supply = await api.call({ abi: 'erc20:totalSupply', target: yzUSD });
            api.add(yzUSD, supply);
        },
    }
};
