const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { getAddress, getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')
const { transformArbitrumAddress, transformOptimismAddress, transformPolygonAddress } = require('../helper/portedTokens')
const { sumTokens, sumTokens2 } = require('../helper/unwrapLPs')

const E_WHITELIST = '0xB43baD2638696F8bC82247B92bD56B8DF37d89aB'
const REGISTRY = '0x06767e8090bA5c4Eca89ED00C3A719909D503ED6' // same on all chains
const GRG_VAULT_ADDRESSES = {
  ethereum: '0xfbd2588b170Ff776eBb1aBbB58C0fbE3ffFe1931',
  arbitrum: '0xE86a667F239A2531C9d398E81154ba125030497e',
  optimism: '0x5932C223186F7856e08A1D7b35ACc2Aa5fC57BfD',
  polygon: '0xF241De983959A483F376fDC8Ed09DC580BA66109'
}
const GRG_TOKEN_ADDRESSES = {
  ethereum: '0x4FbB350052Bca5417566f188eB2EBCE5b19BC964',
  arbitrum: '0x7F4638A58C0615037deCc86f1daE60E55fE92874',
  optimism: '0xEcF46257ed31c329F204Eb43E254C609dee143B3',
  polygon: '0xBC0BEA8E634ec838a2a45F8A43E7E16Cd2a8BA99'
}

// start block is the factory deployment block
const START_BLOCKS = {
  ethereum: 15817831,
  arbitrum: 32290603,
  optimism: 31239365,
  polygon: 34751673
}

async function getStakingBalance(balances, pools, block, chain) {
  const GRG_VAULT = GRG_VAULT_ADDRESSES[chain].toLowerCase()
  const GRG_TOKEN = GRG_TOKEN_ADDRESSES[chain].toLowerCase()

  // we query the rigoblock pools' own staked GRG balance
  const { output: stakedBalances } = await sdk.api.abi.multiCall({
    calls: pools.map((pool) => ({
      target: GRG_VAULT,
      params: [pool],
    })),
    chain,
    abi: abi["balanceOf"],
    block,
  })

  // we store the staked balances
  stakedBalances.forEach(({ output }, i) => sdk.util.sumSingleBalance(balances, GRG_TOKEN, output, chain))
}

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks, { api }) => {
    const START_BLOCK = START_BLOCKS[chain]
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
    const balances = {}
    // we first get native balances
    const zeroAddress = '0x0000000000000000000000000000000000000000'
    for (let pool of pools) {
      tokensAndOwners.push([zeroAddress, pool])
    }
    await sumTokens(balances, tokensAndOwners, block, chain, transform)

    // we add the staked balances of the pools
    await getStakingBalance(balances, pools, block, chain)

    // we append the tokens and owners
    for (let token of uniqueTokens) {
      for (let pool of pools) {
        tokensAndOwners.push([token, pool])
      }
    }

    // get tokens and uni lp token balances
    await sumTokens2({ balances, api, owners: pools, tokensAndOwners, transformAddress: transform, resolveUniV3: true });

    return balances
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
