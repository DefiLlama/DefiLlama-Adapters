
const { getAPI, } = require('./api')
const { transformDexBalances } = require('../portedTokens')
const { getCoreAssets } = require('../tokenMapping')


async function dex(chain) {
  const api = await getAPI(chain)
  const data = await api.query.dex.liquidityPool.entries();

  const coreAssets = getCoreAssets(chain)
  const dexData = []

  const getTokenName = tokenJson => {
    tokenJson = tokenJson.toJSON()
    if (tokenJson.token && coreAssets.includes(tokenJson.token.toLowerCase())) return tokenJson.token
    return chain + ':' + JSON.stringify(tokenJson).replace(/(\{|\}|\s|")/g, '')
  }
  data.forEach(([token, amount]) => {
    dexData.push({
      token0: getTokenName(token.args[0][0]),
      token0Bal: +amount[0],
      token1: getTokenName(token.args[0][1]),
      token1Bal: +amount[1],
    })
  })

  return transformDexBalances({ chain, data: dexData })
}

module.exports = {
  dex
}