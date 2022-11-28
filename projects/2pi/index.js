const sdk           = require('@defillama/sdk')
const utils         = require('../helper/utils')
const archimedesAbi = require('./archimedes.json')

const baseUrl = 'https://api.2pi.network/v1'
const chains  = {
  avax:     'avalanche',
  bsc:      'bsc',
  optimism: 'optimism',
  polygon:  'polygon'
}

const fetchChainAddresses = async chain => {
  const response = await utils.fetchURL(`${baseUrl}/addresses/${chain}`)

  // Doing so we remove duplicates
  return Array.from(new Set(response.data.data.archimedes))
}

const fetchPools = async (chain, block, lengths) => {
  const pools = lengths.map(async length => {
    if (length.success) {
      const target = length.input.target
      const pids   = [...Array(+length.output).keys()]
      const info   = await sdk.api.abi.multiCall({
        block,
        chain,
        calls: pids.map(pid => ({ target, params: [`${pid}`] })),
        abi:   archimedesAbi['poolInfo']
      })

      return info.output
    } else {
      console.warn('Length can not be fetched for', length.input.target)
    }
  })

  return await Promise.all(pools)
}

const fetchPoolLengths = async (chain, block) => {
  const addresses = await fetchChainAddresses(chains[chain])

  return await sdk.api.abi.multiCall({
    block,
    chain,
    calls: addresses.map(address => ({ target: address })),
    abi:   archimedesAbi['poolLength']
  })
}

const fetchBalances = async (chain, block, pools) => {
  const result = {}

  const calls = pools.map(pool => {
    if (pool.success) {
      // Same target and parameters than poolInfo
      return pool.input
    } else {
      console.warn('Pool info request has failed for', pool)
    }
  })

  const balances = await sdk.api.abi.multiCall({
    block,
    chain,
    calls,
    abi: archimedesAbi['balance']
  })

  balances.output.forEach((balance, i) => {
    const poolInfo = pools[i]

    sdk.util.sumSingleBalance(
      result,
      `${chain}:${poolInfo.output.want}`,
      balance.output
    )
  })

  return result
}

const fetchTvl = chain => {
  return async (_timestamp, _block, chainBlocks) => {
    const block   = chainBlocks[chain]
    const lengths = await fetchPoolLengths(chain, block)
    const pools   = await fetchPools(chain, block, lengths.output)

    return await fetchBalances(chain, block, pools.flat())
  }
}

module.exports = {
  misrepresentedTokens: false,
  timetravel:           true,
  ...Object.fromEntries(
    Object.keys(chains).map(chain => [
      chain, { tvl: fetchTvl(chain) }
    ])
  )
}
