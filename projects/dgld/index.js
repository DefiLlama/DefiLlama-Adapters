// One DGLD token corresponds to one fine troy ounce 
// of fully allocated, audited gold held in Swiss custody.
const DGLD_TOKEN = '0xA9299C296d7830A99414d1E5546F5171fA01E9c8';

async function ethereumTvl(api) {
    const totalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: DGLD_TOKEN,
    });

    api.add(DGLD_TOKEN, totalSupply);
}

module.exports = {
    methodology: 'Calculates TVL by multiplying the DGLD total supply by the token price. Each DGLD token represents 1 troy ounce of gold. All tokens are minted on L1 (Ethereum); L2 tokens represent locked L1 tokens, so L1 total supply accounts for all value.',
    ethereum: {
        tvl: ethereumTvl,
    },
};