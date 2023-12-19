const TOKEN_CONTRACT_NOTE = '0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503';
const MARKET_1155TECH_CONTRACT = '0x33b77fAf955Ed3eDAf939ae66C4D7a2D78bc30C6';

async function tvl(_, _1, _2, { api }) {
    const balance = await api.call({
        abi: 'erc20:balanceOf',
        target: TOKEN_CONTRACT_NOTE,
        params: [MARKET_1155TECH_CONTRACT],
    });

    api.add(TOKEN_CONTRACT_NOTE, balance)
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Value of all Keys across all art markets is TVL in the protocol',
    start: 7280880,
    canto: {
        tvl
    }
};