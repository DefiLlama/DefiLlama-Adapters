module.exports = {
    methodology: "Sums the total supplies of Superstate's issued tokens.",
};

const config = {
    ethereum: {
        USTB: '0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e',
    },
}

Object.keys(config).forEach((chain) => {
    let fundsMap = config[chain];
    const fundAddresses = Object.values(fundsMap);

    module.exports[chain] = {
        tvl: async (_, _b, _cb, { api }) => {
            let supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: fundAddresses });
            api.addTokens(fundAddresses, supplies);
            return api.getBalances();
        },
    };
});

