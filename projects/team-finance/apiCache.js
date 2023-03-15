const sdk = require("@defillama/sdk");
const { ethereumContractData, polygonContractData, avaxContractData, bscContractData, kavaContractData, } = require("./config");
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper,  } = require("../helper/unknownTokens")

const project = 'bulky/team-finance'

function getTvl(args) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let totalBalances = {}
    for (let i = 0; i < args.length; i++) {

      const contractAddress = args[i].contract
      const abi = args[i].contractABI
      const chain = args[i].chain
      const cache = await getCache(project, chain) || { vaults: {} }
      if (!cache.vaults) cache.vaults = {}
      if (!cache.vaults[contractAddress]) cache.vaults[contractAddress] = { lastTotalId: 0, tokens: [], }
      const cCache = cache.vaults[contractAddress]
      const block = chainBlocks[chain]
      const trackedTokens = args[i].trackedTokens
      const totalDepositId = Number(
        (
          await sdk.api.abi.call({
            abi: abi.depositId,
            target: contractAddress,
            chain, block
          })
        ).output
      );

      let calls = []
      for (let i = cCache.lastTotalId; i < totalDepositId; i++)
        calls.push({ params: i })
      cCache.lastTotalId = totalDepositId
      const lpAllTokens = (
        await sdk.api.abi.multiCall({
          target: contractAddress,
          abi: abi.getDepositDetails,
          chain, block, calls,
        })
      ).output

      lpAllTokens.forEach(lp => {
        if (!lp.success) return;
        const lpToken = lp.output[0].toLowerCase()
        cCache.tokens.push(lpToken)
      })

      const balances = await vestingHelper({
        cache,
        useDefaultCoreAssets: true,
        owner: contractAddress,
        tokens: cCache.tokens,
        block, chain,
        blacklist: args[i].blacklist,
      })
      await setCache(project, chain, cache)

      for (const [token, balance] of Object.entries(balances))
        sdk.util.sumSingleBalance(totalBalances, token, balance)
    }
    return totalBalances
  }
}

module.exports = {
  methodology: `Counts each LP pair's native token and 
  stable balance, adjusted to reflect locked pair's value. 
  Balances and merged across multiple locker to return sum TVL per chain`,
  ethereum: {
    tvl: getTvl(ethereumContractData),
  },
  bsc: {
    tvl: getTvl(bscContractData),
  },
  polygon: {
    tvl: getTvl(polygonContractData),
  },
  avax: {
    tvl: getTvl(avaxContractData),
  },
  kava: {
    tvl: getTvl(kavaContractData)
  }
};

