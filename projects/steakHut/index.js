const sdk = require('@defillama/sdk');
const { unwrapUniswapLPs, } = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const { staking } = require('../helper/staking');

const steakMasterChef = '0xddBfBd5dc3BA0FeB96Cb513B689966b2176d4c09';

async function tvl(timestamp, block, chainBlocks) {
    block = chainBlocks.avax
    const balances = {};
    const lps = []

    const transformAddress = addr => 'avax:'+addr

    const { output: poolLength } = await sdk.api.abi.call({
        target: steakMasterChef,
        abi: abi.poolLength,
        block: chainBlocks['avax'],
        chain: 'avax',
    });
    // const poolLength = 13
    
    const calls = []

    for (let i = 0;i < poolLength;i++)
        calls.push({params: i})

    const poolInfo = await
        sdk.api.abi.multiCall({
            calls,
            abi: abi.poolInfo,
            chain: 'avax',
            target: steakMasterChef,
            block: chainBlocks['avax'],
        })

    poolInfo.output.map((pool, idx) => {
        let balance = pool.output.totalLpSupply
        let token = pool.output.lpToken
        lps.push({
            token,
            balance,
        })
    })
    await unwrapUniswapLPs(balances, lps, block, 'avax', transformAddress, [], true)
    return balances;
}

const steakToken = "0xb279f8DD152B99Ec1D84A489D32c35bC0C7F5674"

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    start: 14003811,
    methodology: 'Counts the value of JLP tokens staked into SteakMasterChef.',
    avax:{
        tvl,
        staking: staking(steakMasterChef, steakToken, "avax"),
    }
}; 
