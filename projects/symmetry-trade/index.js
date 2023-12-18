const MARKET_CONTRACT = '0x4B9dE260e4283FEEb53F785AabeAa895eC5d46F9';
const TOKENS = [
    "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4", // USDC
    "0xf55bec9cafdbe8730f096aa55dad6d22d44099df", // USDT
    "0x5300000000000000000000000000000000000004", // WETH
    "0x3c1bca5a656e69edcd0d4e36bebb3fcdaca60cf1", // WBTC
    "0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32", // WSTETH
];

async function tvl(_, _1, _2, { api }) {
    for (const token of TOKENS) {
        const collateralBalance = await api.call({
            abi: 'erc20:balanceOf',
            target: token,
            params: [MARKET_CONTRACT],
        });

        api.add(token, collateralBalance)
    }
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'counts the token deposited in market contract',
    start: 923000,
    scroll: {
        tvl,
    }
}; 