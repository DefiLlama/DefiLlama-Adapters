const sdk = require('@defillama/sdk');

const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const GOV_POOL = '0x18174E80335B9fCbc8ac0AB7f40F25aba878ccCC';
const SPLIT_CONTRACT = '0x5b38A73f9dB3F5e12BB4dCb5a434FB3bd3972E53';

async function tvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};

    const splitBalance = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: 'ethereum',
        target: WETH,
        params: [SPLIT_CONTRACT],
        block: ethBlock
    })).output;

    const govBalance = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: 'ethereum',
        target: WETH,
        params: [GOV_POOL],
        block: ethBlock
    })).output;

    await sdk.util.sumSingleBalance(balances, WETH, splitBalance)

    //Adding the Gov WETH balance twice to represent the value of PHI in the pool
    await sdk.util.sumSingleBalance(balances, WETH, govBalance)
    await sdk.util.sumSingleBalance(balances, WETH, govBalance)

    return balances;
};

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Total amount of WETH split, plus the value of Pool2',
    start: 1661851416,
    ethereum: {
        tvl
    }
};