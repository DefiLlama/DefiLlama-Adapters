const { sumTokens2 } = require('../helper/unwrapLPs');
const abi = require('./abi');

const v2Contract = "0x1344A36A1B56144C3Bc62E7757377D288fDE0369"

async function tvl(api) {
  let tokens = await api.fetchList({ lengthAbi: abi.getMaxCurrencyId, itemAbi: abi.getCurrency, target: v2Contract, startFromOne: true, })
  tokens = tokens.flat().map(i => i[0])
  const tokenNames = await api.multiCall({  abi: 'string:name', calls: tokens, permitFailure: true, })
  const nwTokens = tokens.filter((v, i) => tokenNames[i] && tokenNames[i].startsWith('Notional Wrapped'))
  let nwBals = await api.multiCall({  abi: 'erc20:balanceOf', calls: nwTokens.map(i => ({ target: i, params: v2Contract}))})
  const underlyingTokens = await api.multiCall({  abi: 'address:underlying', calls: nwTokens})
  const exchangeRate = await api.multiCall({  abi: 'uint256:getExchangeRateView', calls: nwTokens})
  nwBals = nwBals.map((bal, i) => bal * (exchangeRate[i]/1e18))
  api.addTokens(underlyingTokens, nwBals)
  return sumTokens2({ api, owner: v2Contract, tokens, blacklistedTokens: nwTokens })
}

module.exports = {
  ethereum: { tvl },
};