const sdk = require('@defillama/sdk');
const ARBITRUM_USDT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
const VAULT_CONTRACT = '0xa55D96B2EC5c5899fC69886CACfCba65b91bf8B6';


async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    const chain = "arbitrum"

    const collateralBalance = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: chain,
        target: ARBITRUM_USDT,
        params: [VAULT_CONTRACT],
        block: chainBlocks[chain],
    })).output;

    await sdk.util.sumSingleBalance(balances, ARBITRUM_USDT, collateralBalance, chain)

    return balances;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'counts the number of USDT tokens in the RubyDex Vault contract.',
    // start: 1000235,
    arbitrum: {
        tvl,
    }
}; 