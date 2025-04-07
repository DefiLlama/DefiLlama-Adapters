const TREASURY_LOCKED_ADDRESS = '0x1961a23409ca59eedca6a99c97e4087dad752486';
const UNIV2_TOKEN_ADDRESS = '0x84bf434c13C28f6b7Fa245d7209831ADc57a6597';
const DNA_STAKING_CONTRACT = '0x66512DbB955F18356bf32b908172264e3E08C289';
const DNA_TOKEN_ADDRESS = '0xED49fE44fD4249A09843C2Ba4bba7e50BECa7113';
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

async function tvl(api) {

    const dnaLockedBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: DNA_TOKEN_ADDRESS,
        params: [TREASURY_LOCKED_ADDRESS],
    });

    const wethTokenInUniv2Pool = await api.call({
        abi: 'erc20:balanceOf',
        target: WETH_ADDRESS,
        params: [UNIV2_TOKEN_ADDRESS],
    });

    const dnaInUniv2Pool = await api.call({
        abi: 'erc20:balanceOf',
        target: DNA_TOKEN_ADDRESS,
        params: [UNIV2_TOKEN_ADDRESS],
    });

    const stakingBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: DNA_TOKEN_ADDRESS,
        params: [DNA_STAKING_CONTRACT],
    });

    api.add(DNA_TOKEN_ADDRESS, [dnaLockedBalance, dnaInUniv2Pool, stakingBalance]);
    api.add(WETH_ADDRESS, wethTokenInUniv2Pool);
}

module.exports = {
    methodology: 'counts the number of DNA tokens in the contract.',
    start: 8175720,
    wc: {
        tvl,
    }
};
