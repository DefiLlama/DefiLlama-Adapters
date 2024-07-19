const { getUniTVL } = require('../helper/unknownTokens')
const abi = require('./abi')
const { stakings } = require('../helper/staking')
const sdk = require('@defillama/sdk')
const { createIncrementArray, log } = require('../helper/utils')
const { getChainTransform } = require('../helper/portedTokens')
const { unwrapLPsAuto } = require('../helper/unwrapLPs')

const fox = '0x0159ED2E06DDCD46a25E74eb8e159Ce666B28687'
const vaultChef = '0x2914646e782cc36297c6639734892927b3b6fe56'
const chain = 'harmony'

const dexTVL = getUniTVL({
  factory: '0xfa53b963a39621126bf45f647f813952cd3c5c66',
  useDefaultCoreAssets: true,
})

const vaultTvl = async (_, _b, { [chain]: block }) => {
  const { output: poolLength } = await sdk.api.abi.call({
    target: vaultChef,
    abi: abi.poolLength,
    chain, block,
  })
  const vaultCalls = createIncrementArray(poolLength).map(i => ({ params: i }))

  const { output: vaultRes } = await sdk.api.abi.multiCall({
    target: vaultChef,
    abi: abi.poolInfo,
    calls: vaultCalls,
    chain, block,
  })

  const { output: symbols } = await sdk.api.abi.multiCall({
    abi: 'erc20:symbol',
    calls: vaultRes.map(i => ({ target: i.output.want })),
    chain, block,
  })

  const tokenCalls = []
  const tokens = []
  const blacklisted = [
    '0x4342659cE0Bda7EB9A9621Eb5dF5A67CE8f5ac85',
    '0xAd600896f611686F4B83FfEd29b4AE4BF70558a5',
  ].map(i => i.toLowerCase())
  symbols.forEach(({ output, }, i) => {
    const strat = vaultRes[i].output.strat.toLowerCase()
    if (blacklisted.includes(strat)) {
      return;
    }
    if (output !== 'FOX-LP') {
      tokens.push(vaultRes[i].output.want)
      tokenCalls.push({ target: strat, })
    }
  })

  const { output: tokenRes } = await sdk.api.abi.multiCall({
    abi: abi.wantLockedTotal,
    calls: tokenCalls,
    chain, block,
  })

  const transform = await getChainTransform(chain)
  const balances = {}
  tokenRes.forEach(({ output }, i) => sdk.util.sumSingleBalance(balances, transform(tokens[i]), output))

  await unwrapLPsAuto({ balances, chain, block, transformAddress: transform, })
  return balances
}


module.exports = {
  harmony: {
    tvl: sdk.util.sumChainTvls([vaultTvl, dexTVL]),
    staking: stakings(['0x15e04418d328c39bA747690F6DaE9Bbf548CD358', '0xA68E643e1942fA8635776b718F6EeD5cEF2a3F15',], '0x0159ed2e06ddcd46a25e74eb8e159ce666b28687')
  }
}