const sdk = require("@defillama/sdk");

const chain = 'xdc';
const WXDC = '0x951857744785e80e2de051c32ee7b25f9c458c42';
const WXDCHolders = [
    '0x9B4aCeFE2dB986Ca080Dc01d137e6566dBE0aA3a', // CDP Vault CollateralPoolId "0x5844430000000000000000000000000000000000000000000000000000000000"
];

const fetchWXDCBalances = async (timestamp, block, chainBlocks) => {
    const balances = {};
    const blockXdc = chainBlocks[chain];

    for (const holder of WXDCHolders) {
        const balance = await sdk.api.erc20.balanceOf({
            target: WXDC,
            owner: holder,
            block: blockXdc,
            chain,
        });
        sdk.util.sumSingleBalance(balances, `${chain}:${WXDC}`, balance.output);
    }

    return balances;
};


module.exports = {
    xdc: {
        tvl: sdk.util.sumChainTvls([
            fetchWXDCBalances,
        ]),
    },
};

