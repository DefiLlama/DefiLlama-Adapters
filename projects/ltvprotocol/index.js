const AAVE_COLLATERAL_TOKEN_CONTRACT = '0x0b925ed163218f6662a35e0f0371ac234f9e9371';
const COLLATERAL_TOKEN_CONTRACT = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
const AAVE_BORROWED_TOKEN_CONTRACT = '0xeA51d7853EEFb32b6ee06b1C12E6dcCA88Be0fFE';
const BORROWED_TOKEN_CONTRACT = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const VAULT_CONTRACT = '0xa260b049ddD6567E739139404C7554435c456d9E';

async function tvl(api) {
    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: AAVE_COLLATERAL_TOKEN_CONTRACT,
        params: [VAULT_CONTRACT],
    });

    api.add(COLLATERAL_TOKEN_CONTRACT, collateralBalance)
}

async function borrowed(api) {
    const borrowedBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: AAVE_BORROWED_TOKEN_CONTRACT,
        params: [VAULT_CONTRACT],
    });
    api.add(BORROWED_TOKEN_CONTRACT, borrowedBalance)
}

module.exports = {
    methodology: 'counts all the collateral locked in the vault.',
    start:
        "2025-11-12",
    ethereum: {
        tvl,
        borrowed,
    }
}; 