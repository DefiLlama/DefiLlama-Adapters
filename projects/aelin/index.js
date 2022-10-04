const sdk = require('@defillama/sdk');
const { request, gql } = require("graphql-request");
const { getBlock } = require('../helper/getBlock');
const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const { default: BigNumber } = require('bignumber.js')
const abi = require('./abi.json')

const aelin_data = {
  'ethereum': {
    'graphUrl': 'https://api.thegraph.com/subgraphs/name/aelin-xyz/aelin',
    'AELIN_ETH_LP': '0x974d51fafc9013e42cbbb9465ea03fe097824bcc',
    'AELIN_ETH_staking': '0x944cb90082fc1416d4b551a21cfe6d7cc5447c80',
    'AELIN': '0xa9c125bf4c8bb26f299c00969532b66732b1f758'
  },
  'optimism': {
    'graphUrl': 'https://api.thegraph.com/subgraphs/name/aelin-xyz/optimism', 
    'AELIN': '0x61BAADcF22d2565B0F471b291C475db5555e0b76',
    'AELIN_staking': '0xfe757a40f3eda520845b339c698b321663986a4d',
    'AELIN_ETH_LP': '0x665d8D87ac09Bdbc1222B8B9E72Ddcb82f76B54A',
    'AELIN_ETH_staking': '0x4aec980a0daef4905520a11b99971c7b9583f4f8',
    'vAELIN': '0x780f70882fF4929D1A658a4E8EC8D4316b24748A', 
  },
}
// https://thegraph.com/hosted-service/subgraph/aelin-xyz/optimism
const graphQuery = gql`
query GET_AELIN_POOLS ($minGotchiId: Int, $block: Int) {
  poolCreateds(
    first: 1000
    skip: 0
    block: { number: $block }
  ) {
    id
    name
  }
  totalPoolsCreateds(first: 5) {
    count
  }
}`

function tvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks, false) - 100; // graph out of sync
    
    const { poolCreateds, totalPoolsCreateds } = await request(
      aelin_data[chain]['graphUrl'],
      graphQuery, 
      {block}
    );

    const n_pools = totalPoolsCreateds[0]['count']
    const poolsAddressesCalls = poolCreateds.map(p => ({ target: p.id }))
    console.log(`${chain} - ${block}: n_pools: ${poolsAddressesCalls.length} / ${n_pools}`) // , poolsAddressesCalls)
    
    const {output: purchaseTokens} = await sdk.api.abi.multiCall({
      calls: poolsAddressesCalls,
      abi: abi["aelinPool_purchaseToken"],
      chain,
      block,
    })
    const balancesCall = purchaseTokens.map((purchaseToken, i) => 
      ({ target: purchaseToken.output, params: [poolCreateds[i].id] }))
    const tokenBalances = await sdk.api.abi.multiCall({
      calls: balancesCall,
        abi: "erc20:balanceOf",
        chain,
      block,
    })

    // console.log(rewardsBalances.output.map(b => b.input.params + ' aelinRewardsAddress pool has: ' + BigNumber(b.output).div(1e18).toFixed(0) + ' of purchaseToken ' + b.input.target))
    const balances = {};
    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, x => `${chain}:${x}`);
    return balances
  }
}

function stakingTVL(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    if (chain === 'ethereum') {
      return {}
    } 

    const staked = await staking(
      aelin_data[chain]['AELIN_staking'], 
      aelin_data[chain]['AELIN'], 
      chain
    ) (timestamp, ethBlock, chainBlocks)
    return staked
  }
}

function pool2TVL(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const stakingContract = aelin_data[chain]['AELIN_ETH_staking']
    const lpToken = aelin_data[chain]['AELIN_ETH_LP']
    const block = await getBlock(timestamp, chain, chainBlocks, false) - 100; // graph out of sync

    if (chain === 'ethereum') {
      const staked = await pool2(stakingContract, lpToken, chain) (timestamp, ethBlock, chainBlocks)
      const aelin_addr = `ethereum:${aelin_data[chain]['AELIN']}`
      staked['AELIN'] = BigNumber(staked[aelin_addr]).div(1e18).toFixed(0)
      staked[aelin_addr] = 0
      return staked
    } 
    else if (chain === 'optimism') {
      const balances = {}
      const transformAddress = (addr) => `${chain}:${addr}`;
      const {output: heldLPshares} = await sdk.api.abi.call({
          abi: 'erc20:balanceOf',
          target: lpToken,
          params: stakingContract,
          chain,
          block,
      })
      const lpBalances = [
        {
          balance: heldLPshares, 
          token: lpToken
        }
      ]
      // Unwrao Gelato pools
      await unwrapUniswapLPs(balances, lpBalances, block, chain, transformAddress, [], false, 'gelato')
      return balances
    }
  }
}

module.exports = {
  ethereum: {
    tvl: tvl('ethereum'),
    pool2: pool2TVL('ethereum'), 
  },
  optimism: {
    tvl: tvl('optimism'),
    staking: stakingTVL('optimism'), 
    pool2: pool2TVL('optimism'), 
  },
  methodology: 'Aelin TVL consists of purchaseTokens held by pools, as well as AELIN token (staking) and LP (pool2) staked to receive a share of the revenue',
}
