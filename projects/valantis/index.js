const ADDRESSES = require('../helper/coreAssets.json')
const { BigNumber } = require('bignumber.js')

const STEX_STHYPE_CONTRACT = '0x39694eFF3b02248929120c73F90347013Aec834d'
const STEX_KHYPE_CONTRACT = '0xbf747D2959F03332dbd25249dB6f00F62c6Cb526'
const STEX_LENS_CONTRACT = '0x95e88072c3fe908101a13584d7A0ff87DaDd88f3'
const STEX_LENS_RESERVES_ABI = 'function getTotalValueToken1(address stex) external view returns (uint256 totalValueToken1)';
const WHYPE = ADDRESSES.hyperliquid.WHYPE;

async function tvl(api) {
    const sthypeStexTvlInTermsOfHype = await api.call({
        abi: STEX_LENS_RESERVES_ABI,
        target: STEX_LENS_CONTRACT,
        params: [STEX_STHYPE_CONTRACT]
    });

    const sthypeStexTvlInTermsOfHypeBigNumber = new BigNumber(sthypeStexTvlInTermsOfHype);

    api.add(WHYPE, sthypeStexTvlInTermsOfHypeBigNumber.toString());

    const khypeStexTvlInTermsOfHype = await api.call({
        abi: STEX_LENS_RESERVES_ABI,
        target: STEX_LENS_CONTRACT,
        params: [STEX_KHYPE_CONTRACT]
    });

    const khypeStexTvlInTermsOfHypeBigNumber = new BigNumber(khypeStexTvlInTermsOfHype);

    api.add(WHYPE, khypeStexTvlInTermsOfHypeBigNumber.toString());
}

module.exports = {
    methodology: 'Counts the total amount of HYPE in Valantis pools',
    start: 1743611,
    hyperliquid: {
        tvl
    }
}
