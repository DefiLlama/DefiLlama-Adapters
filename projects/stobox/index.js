const tokenDetails = {
    bsc: {
        GFST: '0xbA2e788D83eA786d11ED87353763616157A35082',
        STBX: '0x65DaD60a28626309F7504d853AFF0099FeD1aAaF',
        SLX: '0x2C4A911B16435f96e6bD18E4d720a32480554a22',
        LSRWA: '0x475eD67Bfc62B41c048b81310337c1D75D45aADd',
    },
    polygon: {
        CSB23: '0x76381bFCCB35736a854675570c07a73508622AFd',
        MFRET: '0xAa6d73C22A953a6A83B9963052bA73f0C53FC764',
        MRDTS: '0xF71272DBC0Da11aDd09cd44A0b7F7D384C0D5Fe1',
        CTREAL: '0x06c3aa74645f424d24f6C835e8D606D35225Ab96',
    },
};

Object.keys(tokenDetails).forEach((chain) => {
    const tokenAddress = Object.values(tokenDetails[chain]);

    module.exports[chain] = {
        methodology:
            'Total Supply of all security tokens issued by Stobox multiplied by the current price of all assets.',
        tvl: async (api) => {
            let supplies;

            supplies = await api.multiCall({
                abi: 'erc20:totalSupply',
                calls: tokenAddress,
            });
            api.addTokens(tokenAddress, supplies);

            return api.getBalances();
        },
    };
});
