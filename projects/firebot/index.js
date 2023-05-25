const sdk = require('@defillama/sdk');

const FBX_TOKEN_CONTRACT = '0xD125443F38A69d776177c2B9c041f462936F8218';
const FIRE_VAULT_CONTRACT = '0x960d43BE128585Ca45365CD74a7773B9d814dfBE';

const EP_TOKEN_CONTRACT = '0x60Ed6aCEF3a96F8CDaF0c0D207BbAfA66e751af2';

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};

    // Get balance of FBX in the FireVault
    const { output: fireFBXTotalSupply } = await sdk.api.erc20.totalSupply({
        target: FIRE_VAULT_CONTRACT,
        block: chainBlocks['polygon'],
        chain: 'polygon'
    });
    
    const { output: withdrawalRate } = await sdk.api.abi.call({
        target: FIRE_VAULT_CONTRACT,
        abi: 'function withdrawalRate() view returns(uint256)',
        block: chainBlocks['polygon'],
        chain: 'polygon'
    });

    // Calculate FBX in FireVault
    const fbxInVault = BigInt(fireFBXTotalSupply) * BigInt(withdrawalRate) / BigInt('1e18');
    sdk.util.sumSingleBalance(balances, `polygon:${FBX_TOKEN_CONTRACT}`, fbxInVault.toString());

    // Get balance of EP staked
    const { output: epTotalSupply } = await sdk.api.erc20.balanceOf({
        target: EP_TOKEN_CONTRACT,
        owner: EP_TOKEN_CONTRACT,
        block: chainBlocks['polygon'],
        chain: 'polygon'
    });

    // Convert EP balance to FBX equivalent
    const epInFBX = BigInt(epTotalSupply) * BigInt(300);  // 1 EP = 300 FBX
    sdk.util.sumSingleBalance(balances, `polygon:${FBX_TOKEN_CONTRACT}`, epInFBX.toString());

    return balances;
}

module.exports = {
    polygon: {
        tvl
    },
    tvl,
    methodology: 'Counts the number of FBX tokens in the FireVault contract and the amount of staked EP tokens (converted to FBX).'
};
