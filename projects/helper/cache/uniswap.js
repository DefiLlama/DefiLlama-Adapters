
const uniswapAbi = require('../abis/uniswap')
const { getCache, setCache, } = require('../cache');
const { transformBalances, transformDexBalances, } = require('../portedTokens')
const sdk = require('@defillama/sdk')

function getUniTVL({ chain = 'ethereum', coreAssets = [], blacklist = [], whitelist = [], factory, transformAddress,
  skipPair = [],
  useDefaultCoreAssets = false,
  abis = {},
}) {
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)
  const abi = {...uniswapAbi, ...abis}

  return async (ts, _block, { [chain]: block }) => {
    let pairAddresses;
    const pairLength = (await sdk.api.abi.call({ target: factory, abi: abi.allPairsLength, chain, block })).output

    log(chain, ' No. of pairs: ', pairLength)

    let pairNums = Array.from(Array(Number(pairLength)).keys())
    if (skipPair.length) pairNums = pairNums.filter(i => !skipPair.includes(i))

    let pairs = (await sdk.api.abi.multiCall({ abi: abi.allPairs, chain, calls: pairNums.map(num => ({ target: factory, params: [num] })), block })).output

    pairAddresses = pairs.map(result => result.output.toLowerCase())
    const response = await getTokenPrices({
      block, chain, coreAssets, blacklist, lps: pairAddresses, transformAddress, whitelist, allLps: true,
      minLPRatio, log_coreAssetPrices, log_minTokenValue, restrictTokenRatio, abis,
    })
    return transformDexBalances({ chain, data: response.pairBalances2, })
  }
}

module.exports = {
  getUniTVL
}