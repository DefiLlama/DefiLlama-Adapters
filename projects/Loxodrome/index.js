const MINT_TOKEN_CONTRACT = '0xE18568f86dA705F8Ee9f89fA87162216739BDC56';
const MINT_LOXO_BOND_CONTRACT = '0x92bfa051BF12A0AEf9a5E1AC8b2AA7DC1B05a406';
// 0x7812523F7E7C3d415675810a5FF6ec156C5a6564
// 0x92bfa051BF12A0AEf9a5E1AC8b2AA7DC1B05a406
// 0xE18568f86dA705F8Ee9f89fA87162216739BDC56
async function tvl(api) {
    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: MINT_TOKEN_CONTRACT,
        params: [MINT_LOXO_BOND_CONTRACT],
    });

    api.add(MINT_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
    methodology: 'counts the number of MINT tokens in the LOXO Bonding contract.',
    iotex: {
        tvl
    }
}; 