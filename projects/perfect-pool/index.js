const USDC_TOKEN = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const NFT_ACE8 = '0x21F3ea812734b6492D88D268622CF068e9E6D596';
const TREASURY = '0xFe4559392aF0E6988F2d7A4E6447a2E702Ff215d';

async function tvl(api) {
    const ace8balance = await api.call({
        abi: 'erc20:balanceOf',
        target: USDC_TOKEN,
        params: [NFT_ACE8],
    });
    
    const treasuryBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: USDC_TOKEN,
        params: [TREASURY],
    });

    api.add(USDC_TOKEN, ace8balance);
    api.add(USDC_TOKEN, treasuryBalance);
}

module.exports = {
    methodology: 'counts the number of USDC tokens in Perfect Pool contracts.',
    start: 1725311445,
    base: {
    tvl,
    }
}; 