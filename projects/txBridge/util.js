const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const _target = "0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB"
const _targetV2 = "0xbeD1EB542f9a5aA6419Ff3deb921A372681111f6"
const gasQuery = ADDRESSES.linea.WETH_1
const gasAddress = ADDRESSES.null

async function txBridgeTvl(api, { chainId, target = _target, additionalBridges = [], extraTokens } = {}) {
  const totalBalances = await sumTokens2({ api, owner: target, fetchCoValentTokens: true, balances: {}, tokens: extraTokens })
  const tokens = Object.keys(totalBalances).map(token => token.split(':')[1]).filter(token => token !== gasAddress)
  tokens.unshift(gasQuery)
  const balances = (await api.multiCall({
    target,
    calls: tokens.map(token => ({ params: [chainId, token] })),
    abi: "function chainBalance(uint256 chainId, address l1Token) view returns (uint256 balance)",
    permitFailure: true,
  })).map(i => i ?? 0)
  tokens[0] = gasAddress
  api.add(tokens, balances)

  if (additionalBridges.length > 0) {
    for (const bridge of additionalBridges) 
    await txBridgeTvl(api, { chainId, target: bridge, })
  }
  return api.getBalances()
}

async function txBridgeTvlV2(api, { chainId, target = _targetV2, additionalBridges = [], extraTokens } = {}) {
  const totalBalances = await sumTokens2({ api, owner: target, fetchCoValentTokens: true, balances: {}, tokens: extraTokens })
  const tokens = Object.keys(totalBalances).map(token => token.split(':')[1]).filter(token => token !== gasAddress)
  tokens.unshift(gasQuery)
  const assetIds = await api.multiCall({  abi: 'function assetId(address) view returns (bytes32)', calls: tokens, target, permitFailure: true })
  const tokensWithIds = tokens.filter((_token, i) => assetIds[i])
  const assetIdsLegit = assetIds.filter((id) => id)

  const balances = (await api.multiCall({
    target,
    calls: assetIdsLegit.map(token => ({ params: [chainId, token] })),
    abi: "function chainBalance(uint256 chainId, bytes32 assetId) view returns (uint256 balance)",
    permitFailure: true,
  })).map(i => i ?? 0)
  tokensWithIds[0] = gasAddress
  api.add(tokensWithIds, balances)

  if (additionalBridges.length > 0) {
    for (const bridge of additionalBridges) 
    await txBridgeTvl(api, { chainId, target: bridge, })
  }
  return api.getBalances()
}

module.exports = {txBridgeTvl, txBridgeTvlV2,}