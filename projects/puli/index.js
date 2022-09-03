const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const PULI_TOKEN_CONTRACT = '0xaef0a177c8c329cbc8508292bb7e06c00786bbfc';
const PULI_TOKEN_LP_CONTRACT = '0x3ff5cbe338153063d8251d2b6a22a437ec09eef3';

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    const transform = await transformBscAddress();
    
    const collateralBalance = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: 'bsc',
        target: PULI_TOKEN_CONTRACT,
        params: [PULI_TOKEN_LP_CONTRACT],
        block: chainBlocks['bsc'],
    })).output;
    
    await sdk.util.sumSingleBalance(balances, transform(PULI_TOKEN_CONTRACT), collateralBalance)
    
    return balances;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'counts the tvl of Puli',
    bsc: {
        tvl,
    }
}