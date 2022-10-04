const sdk = require('@defillama/sdk')
const {transformPolygonAddress} = require('../helper/portedTokens')

const { getBlock } = require('../helper/getBlock');
const { staking } = require('../helper/staking');

const FACTORY =  '0x8C1EB1e5325049B412B7E71337116BEF88a29b3A';

const startBlocks = {
    polygon: 22518977
}

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const  START_BLOCK = startBlocks[chain]
    const block = await getBlock(timestamp, chain, chainBlocks)
    const logs = (
      await sdk.api.util.getLogs({
        keys: [],
        toBlock: block,
        target: FACTORY,
        fromBlock: START_BLOCK,
        chain,
        topic: 'PoolCreated(address,address,address)',
      })
    ).output

    const pairAddresses = []
    const token0Addresses = []
    const token1Addresses = []

    for (let log of logs) {
      token0Addresses.push(`0x${log.topics[1].substr(-40)}`.toLowerCase())
      token1Addresses.push(`0x${log.topics[2].substr(-40)}`.toLowerCase())
      pairAddresses.push(`0x${log.data.substr(-40)}`.toLowerCase())
    }

    const pairs = {}

    token0Addresses.forEach((token0Address, i) => {
      const pairAddress = pairAddresses[i]
      pairs[pairAddress] = {
        token0Address: token0Address,
      }
    })

    token1Addresses.forEach((token1Address, i) => {
      const pairAddress = pairAddresses[i]
      pairs[pairAddress] = {
        ...(pairs[pairAddress] || {}),
        token1Address: token1Address,
      }
    })

    let balanceCalls = []

    for (let pair of Object.keys(pairs)) {
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
    if(chain === "polygon"){
      transform = await transformPolygonAddress()
    }

    let balances = {};

    sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform)

    return balances;
  }
}


module.exports = {
  polygon: {
    tvl: chainTvl('polygon'),
    staking: staking('0x32CFF674763b06B983C0D55Ef2e41B84D16855bb', '0x0169ec1f8f639b32eec6d923e24c2a2ff45b9dd6', 'polygon')
  }
}