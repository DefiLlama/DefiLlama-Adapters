const sdk = require('@defillama/sdk')
const { getAddress, getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')
const { transformArbitrumAddress, transformOptimismAddress, transformPolygonAddress } = require('../helper/portedTokens')
const { sumTokens, sumTokens2 } = require('../helper/unwrapLPs')

const E_WHITELIST = '0xB43baD2638696F8bC82247B92bD56B8DF37d89aB'
const REGISTRY = '0x06767e8090bA5c4Eca89ED00C3A719909D503ED6' // same on all chains
// start block is the factory deployment block
const startBlocks = {
  ethereum: 15817831,
  arbitrum: 32290603,
  optimism: 31239365,
  polygon: 34751673
}

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks, { api }) => {
    const START_BLOCK = startBlocks[chain]
    const logs = (
      await getLogs({
        api,
        target: REGISTRY,
        fromBlock: START_BLOCK,
        topic: 'Registered(address,address,bytes32,bytes32,bytes32)',
      })
    )
    const whitelistedTokensLogs = (
      await getLogs({
        api,
        target: E_WHITELIST,
        fromBlock: START_BLOCK,
        topic: 'Whitelisted(address,bool)'
      })
    )
    const block = api.block
    const pools = logs.map((i) => getAddress(i.data));
    const tokens = whitelistedTokensLogs.map((i) => getAddress(i.topics[1]))
    // we may have duplicates if a token is first whitelisted than removed
    const uniqueTokens = [...new Set(tokens)]

    let transform = id=>id
    if (chain === "arbitrum") {
      transform = await transformArbitrumAddress()
    } else if (chain === "optimism") {
      transform = await transformOptimismAddress()
    } else if (chain === "polygon") {
      transform = await transformPolygonAddress()
    }

    let tokensAndOwners = []
    const balances = {};
    // we first get native balances
    const zeroAddress = '0x0000000000000000000000000000000000000000'
    for (let pool of pools) {
      tokensAndOwners.push([zeroAddress, pool])
    }
    await sumTokens(balances, tokensAndOwners, block, chain, transform)

    // we append the tokens and owners
    for (let token of uniqueTokens) {
      for (let pool of pools) {
        tokensAndOwners.push([token, pool])
      }
    }

    // get uni lp token balances
    await sumTokens2({ api, owners: pools, transformAddress: transform, resolveUniV3: true });

    return await sumTokens2({ api, tokensAndOwners, transformAddress: transform });
  }
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: chainTvl('ethereum'),
  },
  arbitrum: {
    tvl: chainTvl('arbitrum'),
  },
  optimism: {
    tvl: chainTvl('optimism'),
  },
  polygon: {
    tvl: chainTvl('polygon'),
  },
}
