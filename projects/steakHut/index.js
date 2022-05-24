const sdk = require('@defillama/sdk');
const { unwrapUniswapLPs, unwrapCrv } = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const { transformAvaxAddress } = require('../helper/portedTokens');
const { default: BigNumber } = require('bignumber.js');
const { staking } = require('../helper/staking');
const { addFundsInMasterChef } = require('../helper/masterchef');
const { requery } = require('../helper/requery');
const { call } = require('@defillama/sdk/build/abi');

const steakMasterChef = '0xddBfBd5dc3BA0FeB96Cb513B689966b2176d4c09';

const pools = [
    {pid: 0},
    {pid: 1},
    {pid: 2},
    {pid: 3},
    {pid: 4},
    {pid: 5},
    {pid: 6},
    {pid: 7},
    {pid: 8},
    {pid: 9},
    {pid: 10},
    {pid: 11},
    {pid: 12},
    
]

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    const lps = []
    
    const transformAddress = await transformAvaxAddress()
  
    const calls = {
        calls: pools.map(p => ({
            params: p.pid
        })),
    }

    const [poolInfo] = await Promise.all([
        sdk.api.abi.multiCall({
            ...calls,
            abi: abi.poolInfo,
            chain: 'avax',
            target: steakMasterChef,
            block: chainBlocks['avax'],
        })
    ])
  
    await Promise.all(poolInfo.output.map(async (pool, idx)=>{
        let balance = pool.output.totalLpSupply
        let token = pool.output.lpToken
        lps.push({
            token,
            balance,
        })
    }))
    await unwrapUniswapLPs(balances, lps, block, 'avax', transformAddress, [], true)  
    return balances;
  }

const steakToken = "0xb279f8DD152B99Ec1D84A489D32c35bC0C7F5674"

async function pool2(time, ethBlock, chainBlocks){
    const balances = {}
    
    await addFundsInMasterChef(balances, steakMasterChef, chainBlocks.avax, "avax", addr=>`avax:${addr}`, undefined, [steakToken])
    return balances
}
  
  module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    start: 14003811 ,
    methodology: 'Counts the value of JLP tokens staked into SteakMasterChef.',
    avalanche: {
      tvl,
      pool2, 
      staking: staking(steakMasterChef, steakToken, "avax"),
    }
  }; 
