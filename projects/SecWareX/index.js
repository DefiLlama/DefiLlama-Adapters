
const BigNumber = require('bignumber.js');

const USDT_MINT = "0x55d398326f99059ff775485246999027b3197955";
const SECWAREX_FOUNDATION = "0x34ebddd30ccbd3f1e385b41bdadb30412323e34f";
const SECWAREX_REVENUE_POOL = "0x648d7f4ad39186949e37e9223a152435ab97706c";

const BALANCE_ABI = 'erc20:balanceOf';

async function tvl(api) {
    const foundationBalance = await api.call({
        abi: BALANCE_ABI,
        target: USDT_MINT,
        params: [SECWAREX_FOUNDATION],
    });
    const revenueBalance = await api.call({
        abi: BALANCE_ABI,
        target: USDT_MINT,
        params: [SECWAREX_REVENUE_POOL],
    });
    const total = BigNumber(foundationBalance).plus(BigNumber(revenueBalance)).toFixed(0);
    api.add(USDT_MINT, total);
}

module.exports = {
    bsc: {
        tvl
    },
    methodology: "Count the profits of SecWareX",
    start: 36724659
};
