const DIRAC_VAULT_1_CONTRACT = '0xa9154A433E879fa0E948eA208Aa359271Dc40469';
const USDCE_CONTRACT = '0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5';
const USDC_CONTRACT = '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035';

const DIRAC_VAULT_2_CONTRACT = '0x6d91E01A609e34d58678265ee6b821F0E1b9044E';
const DIRAC_VAULT_3_CONTRACT = '0x714BEC23142375c1A6576A9B7cA302DD1B680237';
const MINT_CLUB_BOND_CONTRACT = '0x8BBac0C7583Cc146244a18863E708bFFbbF19975';

async function tvl(_, _1, _2, { api }) {
    const collateralBalance1 = await api.call({
        abi: 'erc20:balanceOf',
        target: USDCE_CONTRACT,
        params: [DIRAC_VAULT_1_CONTRACT],
    });

    // const collateralBalance2 = await api.call({
    //     abi: 'erc20:balanceOf',
    //     target: USDCE_CONTRACT,
    //     params: [DIRAC_VAULT_2_CONTRACT],
    // });

    api.add(USDCE_CONTRACT, collateralBalance1)
    // api.add(USDCE_CONTRACT, collateralBalance2)
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
    start: 11251616,
    polygon_zkevm: {
        tvl,
    }
}; 