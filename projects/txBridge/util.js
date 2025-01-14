const { sumTokens2 } = require("../helper/unwrapLPs");

const _target = "0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB"
const gasQuery = '0x0000000000000000000000000000000000000001'
const gasAddress = '0x0000000000000000000000000000000000000000'

module.exports = async (api, { chainId, target = _target } = {}) => {
  const totalBalances = await sumTokens2({ api, owner: target, fetchCoValentTokens: true, balances: {} })
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
  return api.getBalances()
}
