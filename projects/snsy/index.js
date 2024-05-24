const SNSY_TOKEN_CONTRACT = '0x82a605D6D9114F4Ad6D5Ee461027477EeED31E34';
const SNSY_CLUB_STAKING_CONTRACT = '0x382c70620e42c2EF2b303b97bad1d9439Bf48ef9';

async function tvl(api) {
    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: SNSY_TOKEN_CONTRACT,
        params: [SNSY_CLUB_STAKING_CONTRACT],
    });

    api.add(SNSY_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
    methodology: 'Counts the number of SNSY tokens in the Staking contract.',
    timetravel: false,
    ethereum: {
        tvl,
    }
}; 