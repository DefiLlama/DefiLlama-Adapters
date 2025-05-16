const sdk = require('@defillama/sdk')
const { APE_STAKE_CONTRACT } = require('./config')

const WAPE = '0x0000000000000000000000000000000000000000' // Native APE token

async function stakingTvl(timestamp, block, chainBlocks) {
    const balances = {};
    
    const balance = await sdk.api.eth.getBalance({
        target: APE_STAKE_CONTRACT,
        chain: 'apechain',
        block: chainBlocks.apechain
    });

    sdk.util.sumSingleBalance(balances, WAPE, balance.output, 'apechain')
    
    return balances;
}

module.exports = {
    apechain: {
        tvl: () => ({}),
        staking: stakingTvl
    }
};
