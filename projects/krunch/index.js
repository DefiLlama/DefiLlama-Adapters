const STABLE_COIN_CONTRACT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
const KRUNCH_CONTRACT = '0xd3ca6e5035a3275909460EFC61d2A68DbEd3CE4c';

async function tvl(_, _1, _2, { api }) {
    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: STABLE_COIN_CONTRACT,
        params: [KRUNCH_CONTRACT],
        chain: 'polygon'
    });

    api.add(STABLE_COIN_CONTRACT, collateralBalance)
    return api.getBalances()
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Gets the balance of the USDT invested in the protocol.',
    polygon: {
        tvl
    }
}; 