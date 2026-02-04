const { sumERC4626VaultsExport2 } = require('../helper/erc4626');
const { sumTokensExport } = require('../helper/unwrapLPs')

const AAVE_COLLATERAL_TOKEN_CONTRACT = '0x0b925ed163218f6662a35e0f0371ac234f9e9371';
const COLLATERAL_TOKEN_CONTRACT = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
const AAVE_BORROWED_TOKEN_CONTRACT = '0xeA51d7853EEFb32b6ee06b1C12E6dcCA88Be0fFE';
const VAULT_CONTRACT = '0xa260b049ddD6567E739139404C7554435c456d9E';

module.exports = {
    methodology: 'Value of ETH deposited in the LTV Protocol vault on Ethereum',
    start:
        "2025-11-12",
    ethereum: {
        // tvl: sumTokensExport({ owner: VAULT_CONTRACT, tokens: [COLLATERAL_TOKEN_CONTRACT, AAVE_COLLATERAL_TOKEN_CONTRACT, AAVE_BORROWED_TOKEN_CONTRACT] }),
        tvl: sumERC4626VaultsExport2({  vaults: [VAULT_CONTRACT],}),
    }
}; 