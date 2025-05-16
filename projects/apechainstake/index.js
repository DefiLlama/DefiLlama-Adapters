const sdk = require('@defillama/sdk')
const { nullAddress } = require('../helper/unwrapLPs')
const { APE_STAKE_CONTRACT } = require('./config')

async function stakingTvl(timestamp, block, chainBlocks) {
    const balances = {};
    
    const balance = await sdk.api.eth.getBalance({
        target: APE_STAKE_CONTRACT,
        chain: 'apechain',
        block: chainBlocks.apechain
    });

    sdk.util.sumSingleBalance(balances, nullAddress, balance.output, 'apechain')
    
    return balances;
}

module.exports = {
    apechain: {
        tvl: () => ({}),
        staking: stakingTvl
    }
};
