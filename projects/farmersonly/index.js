const { getUniTVL, sumUnknownTokens } = require('../helper/unknownTokens')
const abi = require('./abi')
const { stakings } = require('../helper/staking')
const sdk = require('@defillama/sdk')

const vaultChef = '0x2914646e782cc36297c6639734892927b3b6fe56'

const dexTVL = getUniTVL({
  factory: '0xfa53b963a39621126bf45f647f813952cd3c5c66',
  useDefaultCoreAssets: true,
})

const vaultTvl = async (api) => {
  const vaultRes = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: vaultChef, })
  const wants = vaultRes.map(i => i.want)
  const symbols = await api.multiCall({  abi: 'erc20:symbol', calls: wants,  })

  const tokenCalls = []
  const tokens = []
  const blacklisted = [
    '0x4342659cE0Bda7EB9A9621Eb5dF5A67CE8f5ac85',
    '0xAd600896f611686F4B83FfEd29b4AE4BF70558a5',
  ].map(i => i.toLowerCase())
  symbols.forEach((symbol, i) => {
    const strat = vaultRes[i].strat.toLowerCase()
    if (blacklisted.includes(strat)) {
      return;
    }
    if (symbol !== 'FOX-LP') {
      tokens.push(vaultRes[i].want)
      tokenCalls.push({ target: strat, })
    }
  })
  const balances = await api.multiCall({  abi:abi.wantLockedTotal , calls: tokenCalls })
  api.add(tokens, balances)
  return sumUnknownTokens({ api, resolveLP: true})
}


module.exports = {
  harmony: {
    tvl: sdk.util.sumChainTvls([vaultTvl, dexTVL]),
    staking: stakings(['0x15e04418d328c39bA747690F6DaE9Bbf548CD358', '0xA68E643e1942fA8635776b718F6EeD5cEF2a3F15',], '0x0159ed2e06ddcd46a25e74eb8e159ce666b28687')
  }
}