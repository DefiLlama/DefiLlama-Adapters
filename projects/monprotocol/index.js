const sdk = require('@defillama/sdk');
const tokenAddress = '0xc555D625828c4527d477e595fF1Dd5801B4a600e';
const stakingContracts = [
    '0x65A8b32bc4dE5E0156DBa85Ce615d9ef8ea59780',
    '0xd0c40b774ecfBc7B0632d23F871Cc0E523aad8F3', 
    '0xa305A8C63a5305Cc2D4d58c41F1d7C662C95475b',
    '0x57136E05e6b1F502bd56B5439fCC1039A8250ED2'
];

async function staking(timestamp, ethBlock, chainBlocks) {
    const balances = {};

    for (const address of stakingContracts) {
        const balanceStaked = await sdk.api.erc20.balanceOf({
            target: tokenAddress,
            owner: address,
            chain: 'ethereum',
            block: ethBlock,
        });

        sdk.util.sumSingleBalance(balances, tokenAddress, balanceStaked.output);
    }

    return balances;
}

module.exports = {
    ethereum: {
        tvl: () => ({}),
        staking,
    },
    methodology: 'Counts the balance of staked tokens in the staking, claims, and rewards registry.',
};
