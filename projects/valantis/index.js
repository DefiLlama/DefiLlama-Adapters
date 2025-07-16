const ADDRESSES = require('../helper/coreAssets.json')
const { BigNumber } = require('bignumber.js')

const STEX_CONTRACT = '0x39694eFF3b02248929120c73F90347013Aec834d';
const STEX_LENS_CONTRACT = '0x68675DC8406252b6950128f6504A5E287Ef24ED0';
const STEX_LENS_RESERVES_ABI = 'function getAllReserves(address stex) external view returns (uint256 reserve0Pool, uint256 reserve0Unstaking, uint256 reserve1Pool, uint256 reserve1Lending, uint256 amount1PendingLPWithdrawal)';
const WHYPE = ADDRESSES.hyperliquid.WHYPE;
const STHYPE = '0xfFaa4a3D97fE9107Cef8a3F48c069F577Ff76cC1';

async function tvl(api) {
    const stexReserves = await api.call({
        abi: STEX_LENS_RESERVES_ABI,
        target: STEX_LENS_CONTRACT,
        params: [STEX_CONTRACT]
    });

    // Calculate human-readable amounts
    const reserve0Pool = new BigNumber(stexReserves[0]);
    const reserve0Unstaking = new BigNumber(stexReserves[1]);
    const reserve1Pool = new BigNumber(stexReserves[2]);
    const reserve1Lending = new BigNumber(stexReserves[3]);
    const amount1PendingLPWithdrawal = new BigNumber(stexReserves[4]);

    const stHypePoolAmount = reserve0Pool.plus(reserve0Unstaking);
    const hypePoolAmount = reserve1Pool.plus(reserve1Lending).plus(amount1PendingLPWithdrawal);

    // Add balances using the token addresses directly
    // The API will handle the decimals internally
    api.add(WHYPE, hypePoolAmount.toString());
    api.add(STHYPE, stHypePoolAmount.toString());
}

module.exports = {
    methodology: 'Counts the total amount of HYPE in Valantis pools',
    start: 1743611,
    hyperliquid: {
        tvl
    }
}
