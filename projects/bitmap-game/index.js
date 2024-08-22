const STAKE_MERL_CONTRACT = '0xb311c4b8091aff30Bb928b17Cc59Ce5D8775b13A';
const MERL_TOKEN = '0x5c46bFF4B38dc1EAE09C5BAc65872a1D8bc87378';
const STAKE_BITMAP_TOKEN_CONTRACT = '0x8567bD39b8870990a2cA14Df3102a00A7d72f7E3';
const BITMAP_TOKEN = '0x7b0400231Cddf8a7ACa78D8c0483890cd0c6fFD6';

async function tvl(api) {
    //1.merl
    const merlBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: MERL_TOKEN,
        params: STAKE_MERL_CONTRACT,
    });

    api.add(MERL_TOKEN, merlBalance);

    //bitmapToken rent contract
    const bitmapTokenRentContractBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: BITMAP_TOKEN,
        params: [STAKE_BITMAP_TOKEN_CONTRACT],
    });

    //bitmapToken stake contract
    const bitmapTokenStakeContractBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: BITMAP_TOKEN,
        params: [STAKE_MERL_CONTRACT],
    });

    //2.bitmapToken all
    const bitmapTokenBalance = BigInt(bitmapTokenRentContractBalance) + BigInt(bitmapTokenStakeContractBalance)
    api.add(BITMAP_TOKEN, bitmapTokenBalance)
}

module.exports = {
    merlin: {
        tvl,
    }
};
