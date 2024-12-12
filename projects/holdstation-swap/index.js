const sdk = require('@defillama/sdk')
const { getLogs } = require('../helper/cache/getLogs')

const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY =  '0x1153D1d27A558471eF051c5D2D075d7D07B84A07';
const startBlocks = {
  era: 31199634
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

    for (let pair of Object.keys(pairs)) {
        console.log(`pair is ${pair}`)
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
        calls: balanceCalls,
        block,
        chain,
      })
    )
    
    let transform = id=>id

    let balances = {};

    sdk.util.sumMultiBalanceOf(balances, tokenBalances)
    return balances;
  }
}

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: chainTvl('era')
  }
}
