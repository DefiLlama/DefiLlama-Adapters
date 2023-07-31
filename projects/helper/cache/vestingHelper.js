const sdk = require('@defillama/sdk');

const { stripTokenHeader, getFixBalancesSync, } = require('../portedTokens')
const { getCoreAssets } = require('../tokenMapping')
const { sumTokens2, } = require('../unwrapLPs')
const { getUniqueAddresses, sliceIntoChunks, sleep, log } = require('../utils')
const { getTokenPrices, getLPList } = require('./sumUnknownTokens')

async function vestingHelper({
  coreAssets = [], owner, tokens, chain = 'ethereum', block, restrictTokenRatio, blacklist = [], skipConversion = false, onlyLPs, minLPRatio,
  log_coreAssetPrices = [], log_minTokenValue = 1e6, useDefaultCoreAssets = false, cache = {},
}) {
  if (!coreAssets.length && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)

  tokens = getUniqueAddresses(tokens)
  blacklist = getUniqueAddresses(blacklist)
  tokens = tokens.filter(t => !blacklist.includes(t))
  const chunkSize = chain === 'polygon' ? 250 : 500  // polygon has a lower gas limit
  const chunks = sliceIntoChunks(tokens, chunkSize)
  const finalBalances = {}
  for (let i = 0; i < chunks.length; i++) {
    log('resolving for %s/%s of total tokens: %s (chain: %s)', i + 1, chunks.length, tokens.length, chain)
    let lps = await getLPList({ lps: chunks[i], chain, block, cache })  // we count only LP tokens for vesting protocols
    const balances = await sumTokens2({ chain, block, owner, tokens: lps })
    const lpBalances = {}
    Object.entries(balances).forEach(([token, bal]) => {
      if (bal && bal !== 0)
        lpBalances[stripTokenHeader(token)] = bal
      else
        delete balances[token]
    })
    lps = lps.filter(lp => lpBalances[lp])  // we only care about LPs that are still locked in the protocol, we can ignore withdrawn LPs
    const { updateBalances } = await getTokenPrices({ cache, coreAssets, lps, allLps: true, chain, block, restrictTokenRatio, blacklist, log_coreAssetPrices, log_minTokenValue, minLPRatio })
    await updateBalances(balances, { skipConversion, onlyLPs })
    Object.entries(balances).forEach(([token, bal]) => sdk.util.sumSingleBalance(finalBalances, token, bal))
    if (i > 3 && i % 2 === 0) await sleep(1000)
  }
  const fixBalances = getFixBalancesSync(chain)
  fixBalances(finalBalances)
  return finalBalances
}

module.exports = {
  vestingHelper,
}