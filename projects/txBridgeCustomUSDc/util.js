const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const _target = "0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB"
const _nativeUSDCBridge = "0xf553E6D903AA43420ED7e3bc2313bE9286A8F987"
const gasQuery = ADDRESSES.linea.WETH_1
const gasAddress = ADDRESSES.null

module.exports = async (api, { chainId, target = _target } = {}) => {
  const totalBalances = await sumTokens2({ api, owner: target, fetchCoValentTokens: true, balances: {} })
  const nativeUSDCBalances = await sumTokens2({ api, owner: _nativeUSDCBridge, fetchCoValentTokens: true, balances: {} })
  const tokens = Object.keys(totalBalances).map(token => token.split(':')[1]).filter(token => token !== gasAddress)
  const nativeUSDC = Object.keys(nativeUSDCBalances).map(token => token.split(':')[1]).filter(token => token !== gasAddress)
  tokens.unshift(gasQuery)
  const balances = (await api.multiCall({
    target,
    calls: tokens.map(token => ({ params: [chainId, token] })),
    abi: "function chainBalance(uint256 chainId, address l1Token) view returns (uint256 balance)",
    permitFailure: true,
  })).map(i => i ?? 0)
  const usdcBalance = (await api.multiCall({
    target: _nativeUSDCBridge,
    calls: nativeUSDC.map(token => ({ params: [chainId, token] })),
    abi: "function chainBalance(uint256 chainId, address l1Token) view returns (uint256 balance)",
    permitFailure: true,
  })).map(i => i ?? 0)

  tokens[0] = gasAddress
  api.add(tokens, balances)
  api.add(nativeUSDC, usdcBalance)
  return api.getBalances()
}
