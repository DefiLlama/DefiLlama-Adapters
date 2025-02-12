const ADDRESSES = require('../helper/coreAssets.json')
const DIRAC_VAULT_1_CONTRACT = '0xa9154A433E879fa0E948eA208Aa359271Dc40469';
const USDCE_CONTRACT = ADDRESSES.polygon_zkevm.USDC_CIRCLE;
const USDC_CONTRACT = ADDRESSES.astarzk.USDC;

const DIRAC_VAULT_2_CONTRACT = '0x6d91E01A609e34d58678265ee6b821F0E1b9044E';
const DIRAC_VAULT_3_CONTRACT = '0x714BEC23142375c1A6576A9B7cA302DD1B680237';
const MINT_CLUB_BOND_CONTRACT = '0x8BBac0C7583Cc146244a18863E708bFFbbF19975';

async function tvl(_, _1, _2, { api }) {
    const collateralBalance1 = await api.call({
        abi: 'erc20:balanceOf',
        target: USDCE_CONTRACT,
        params: [DIRAC_VAULT_1_CONTRACT],
    });

    const collateralBalance2 = await api.call({
        abi: 'erc20:totalSupply',
        target: DIRAC_VAULT_2_CONTRACT,
        params: [],
    });

    const collateralBalance3 = await api.call({
        abi: 'erc20:totalSupply',
        target: DIRAC_VAULT_3_CONTRACT,
        params: [],
    });

    api.add(USDCE_CONTRACT, collateralBalance1)
    api.add(USDCE_CONTRACT, collateralBalance2)
    api.add(USDCE_CONTRACT, collateralBalance3)
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
    polygon_zkevm: {
        tvl,
    }
}; 