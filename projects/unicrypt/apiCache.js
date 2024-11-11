const sdk = require('@defillama/sdk');
const { config, protocolPairs, tokens, stakingContracts,
  ethereumContractData, baseContractData, bscContractData, polygonContractData,
  avalancheContractData, gnosisContractData, arbitrumContractData, } = require('./config')
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper, } = require("../helper/unknownTokens")
const project = 'bulky/unicrypt'

const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

function tvl(args) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let totalBalances = {}
    for (let i = 0; i < args.length; i++) {
      const chain = args[i].chain
      const contract = args[i].contract.toLowerCase()
      const cache = await getCache(project, chain)
      if (!cache.vaults) cache.vaults = {}
      if (!cache.vaults[contract]) cache.vaults[contract] = { tokens: [] }
      const cCache = cache.vaults[contract]
      let block = chainBlocks[chain]
      const { output: totalDepositId } = await sdk.api.abi.call({
        target: contract,
        abi: args[i].getNumLockedTokensABI,
        chain, block,
      })

      let tokens = cCache.tokens;
      let j = cCache.lastTotalDepositId || 0
      cCache.lastTotalDepositId = +totalDepositId
      let calls = []
      for (; j < totalDepositId; j++)
        calls.push({ target: contract, params: j })

      const lpAllTokens = (
        await sdk.api.abi.multiCall({
          abi: args[i].getLockedTokenAtIndexABI,
          calls, chain, block,
        })
      ).output

      lpAllTokens.forEach(lp => {
        if (!lp.success) return;
        const lpToken = lp.output
        tokens.push(lpToken)
      })

      const blacklist = [...(args[i].pool2 || [])]

      if (chain === 'ethereum')
        blacklist.push('0x72E5390EDb7727E3d4e3436451DADafF675dBCC0') // HANU

      let balances = await vestingHelper({
        chain, block,
        owner: contract,
        useDefaultCoreAssets: true,
        blacklist,
        tokens,
        cache,
      })

      for (const [token, balance] of Object.entries(balances))
        sdk.util.sumSingleBalance(totalBalances, token, balance)
      await setCache(project, chain, cache)
    }
    return totalBalances
  }
}

module.exports = {
  methodology:
    `Counts each LP pair's native token and 
   stable balance, adjusted to reflect locked pair's value. 
   Balances and merged across multiple 
   locker and staking contracts to return sum TVL per chain`,

  ethereum: {
    staking: stakings(
      stakingContracts,
      tokens.uncx_eth,
      config.uniswapv2.chain
    ),
    tvl: tvl(ethereumContractData),

    pool2: pool2s([config.uniswapv2.locker, config.pol.locker],
      [protocolPairs.uncx_WETH],
      config.uniswapv2.chain)
  },
  base: {
    tvl: tvl(baseContractData)
  },
  bsc: {
    tvl: tvl(bscContractData),

    pool2: pool2s([config.pancakeswapv2.locker, config.pancakeswapv1.locker, config.safeswap.locker,
    config.julswap.locker, config.biswap.locker],
      [protocolPairs.uncx_BNB], config.pancakeswapv2.chain)
  },
  polygon: {
    tvl: tvl(polygonContractData)
  },
  avax: { tvl: tvl(avalancheContractData) },
  arbitrum: { tvl: tvl(arbitrumContractData) },
  xdai: {
    tvl: tvl(gnosisContractData),
    pool2: pool2s([config.honeyswap.locker],
      [protocolPairs.uncx_XDAI],
      config.honeyswap.chain)
  },
}

