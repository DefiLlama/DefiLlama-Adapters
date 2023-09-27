const ARBI_CONTRACT = '0xfc2f1678f7c0d78c3911090c92b86bca7cc3a8b7';
const ASSETS_CONTRACTS = [
    '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a',
    '0x11cdb42b0eb46d95f990bedd4695a6e3fa034978',
    '0x18c11fd286c5ec11c3b683caa813b77f5163a122',
    '0xb64e280e9d1b5dbec4accedb2257a87b400db149',
    '0x4e352cf164e64adcbad318c3a1e222e9eba4ce42',
];

async function tvl(_, _1, _2, { api }) {
    for (let i = 0; i < ASSETS_CONTRACTS.length; i++) {
        const collateralBalance = await api.call({
            abi: 'erc20:balanceOf',
            target: ASSETS_CONTRACTS[i],
            params: [ARBI_CONTRACT],
        });
        api.add(ASSETS_CONTRACTS[i], collateralBalance)
    }

}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'counts the quantities of all tokens in multipool contracts.',
    start: 1000235,
    arbitrum: {
        tvl,
    }
}; 
