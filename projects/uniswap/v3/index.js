const sdk = require('@defillama/sdk')
const oldOptPools = require('./oldUniPools.json')
const { getLogs } = require('../../helper/cache/getLogs')

const FACTORY =  '0x1F98431c8aD98523631AE4a59f267346ea31F984'; // same on all chains
const startBlocks = {
  ethereum: 12369621,
  arbitrum: 165,
  optimism: 27446
}

function chainTvl(chain) {
  return async (api) => {
    const  START_BLOCK = startBlocks[chain]
    const logs = (
      await getLogs({
        api,
        target: FACTORY,
        fromBlock: START_BLOCK,
        topic: 'PoolCreated(address,address,uint24,int24,address)',
      })
    )
    const block = api.block

    const pairAddresses = []
    const token0Addresses = []
    const token1Addresses = []
    if(chain === "optimism"){
      for(const pool of oldOptPools){
        token0Addresses.push(pool.token0)
        token1Addresses.push(pool.token1)
        pairAddresses.push(pool.newAddress)
      }
    }
    for (let log of logs) {
      token0Addresses.push(`0x${log.topics[1].substr(-40)}`.toLowerCase())
      token1Addresses.push(`0x${log.topics[2].substr(-40)}`.toLowerCase())
      pairAddresses.push(`0x${log.data.substr(-40)}`.toLowerCase())
    }

    const pairs = {}
    // add token0Addresses
    token0Addresses.forEach((token0Address, i) => {
      const pairAddress = pairAddresses[i]
      pairs[pairAddress] = {
        token0Address: token0Address,
      }
    })

    // add token1Addresses
    token1Addresses.forEach((token1Address, i) => {
      const pairAddress = pairAddresses[i]
      pairs[pairAddress] = {
        ...(pairs[pairAddress] || {}),
        token1Address: token1Address,
      }
    })

    let balanceCalls = []

    const exclude = ["0xc064472729952ffb570217f01a701766e8bee0c0", "0xaaba8a92687bfdba363a3ccb29991599d84fed8f"]
    for (let pair of Object.keys(pairs)) {
      if(exclude.includes(pair)){
        continue;
      }
      balanceCalls.push({
        target: pairs[pair].token0Address,
        params: pair,
      })
      balanceCalls.push({
        target: pairs[pair].token1Address,
        params: pair,
      })
    }

    const tokenBalances = (
      await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls.filter(c=>c.target !== "0x290a6a7460b308ee3f19023d2d00de604bcf5b42" && c.target !== "0x4c83a7f819a5c37d64b4c5a2f8238ea082fa1f4e"),
        block,
        chain,
      })
    )
    let transform = id=>id
    if(chain === "optimism"){
      transform = i => `optimism:${i}`
    } else if(chain === "arbitrum"){
      transform = i => `arbitrum:${i}`
    }

    let balances = {};

    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform)

    return balances;
  }
}



module.exports = {
  misrepresentedTokens: true,
  optimism: {
    tvl: chainTvl('optimism'),
  },
  ethereum: {
    tvl: chainTvl('ethereum'),
  },
  arbitrum: {
    tvl: chainTvl('arbitrum'),
  },
}