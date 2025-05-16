const sdk = require('@defillama/sdk')
const { nullAddress } = require('../helper/unwrapLPs')
const { APE_STAKE_CONTRACT } = require('./config')

const abi = {
    getPoolsUI: "function getPoolsUI() view returns ((uint256,uint256,(uint48,uint48,uint96,uint96))[3])"
}

async function stakingTvl(api) {
    const balances = {};
    
    const pools = await api.call({
        target: APE_STAKE_CONTRACT,
        abi: abi.getPoolsUI,
        chain: 'apechain'
    });
    
    const totalStaked = pools.reduce((sum, pool) => sum + BigInt(pool[1]), 0n);    
    sdk.util.sumSingleBalance(balances, nullAddress, totalStaked.toString(), 'apechain')    
    return balances;
}

module.exports = {
    apechain: {
        tvl: () => ({}),
        staking: stakingTvl
    }
};
