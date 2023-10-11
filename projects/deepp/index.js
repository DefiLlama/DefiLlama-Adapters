const BetLiquidityPoolABI = [
    "function getTokenBalance(address tokenAdd) view returns (uint256)",
    "function getFullBalance(address tokenAdd) view returns (uint256)",
];

const USDC_TOKEN_CONTRACT = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
const BET_LP_CONTRACT = '0x84a512E120294C2017a88a8f1af2219Ec250CBaa';

async function tvl(_, _1, _2, { api }) {
    const fullPoolBalance = await api.call({
        abi: BetLiquidityPoolABI[1],
        target: BET_LP_CONTRACT,
        params: [USDC_TOKEN_CONTRACT],
    });

    api.add(USDC_TOKEN_CONTRACT, fullPoolBalance)
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Lists the number of owned USDC tokens in the Deepp LP and BetLock contracts.',
    start: 1696118400,
    arbitrum: {
        tvl,
    }
}; // node test.js projects/deepp/index.js