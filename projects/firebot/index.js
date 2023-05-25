const sdk = require('@defillama/sdk');

const FBX_TOKEN_CONTRACT = '0xD125443F38A69d776177c2B9c041f462936F8218';
const FIRE_VAULT_CONTRACT = '0x960d43BE128585Ca45365CD74a7773B9d814dfBE';
const EP_TOKEN_CONTRACT = '0x60Ed6aCEF3a96F8CDaF0c0D207BbAfA66e751af2';

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    // Get balance of FBX in the FBX Vault
    const { output: fbxBalance } = await sdk.api.erc20.balanceOf({
        target: FBX_TOKEN_CONTRACT,
        owner: FIRE_VAULT_CONTRACT,
        block: chainBlocks['polygon'],
        chain: 'polygon'
    });
    sdk.util.sumSingleBalance(balances, `polygon:${FBX_TOKEN_CONTRACT}`, fbxBalance.toString());

    // Get balance of EP staked in the EP Vault
    const { output: epBalance } = await sdk.api.erc20.balanceOf({
        target: EP_TOKEN_CONTRACT,
        owner: EP_TOKEN_CONTRACT,
        block: chainBlocks['polygon'],
        chain: 'polygon'
    });
    sdk.util.sumSingleBalance(balances, `polygon:${EP_TOKEN_CONTRACT}`, epBalance.toString());

    return balances;
}

module.exports = {
    polygon: {
        tvl
    },
    tvl,
    methodology: 'Counts the number of FBX and EP tokens in the Vault contracts.'
};
