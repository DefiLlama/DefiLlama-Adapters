const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const { getLogs } = require('../helper/cache/getLogs')

const factory = '0xbd16088611054fce04711aa9509d1d86e04dce2c'
const wl_stETH_token = '0xf9a98a9452485ed55cd3ce5260c2b71c9807b11a'

async function tvl(api) {

  const logs = (
    await getLogs({
      api,
      target: factory,
      fromBlock: 14916925,
      onlyArgs: true,
      eventAbi: "event DeployYieldTokenPair(address indexed gate, address indexed vault, address nyt, address pyt)",
    })
  )
  const toa = logs.map(i => [i.vault, i.gate])

  await sumTokens2({ api, tokensAndOwners: toa, })
  const wl_stETH = wl_stETH_token
  const balances = api.getBalances()
  const wl_stETH_balance = balances['ethereum:'+wl_stETH]
  if (wl_stETH_balance) {
    delete balances['ethereum:'+wl_stETH]
    const unwrappedAsset = await api.call({ target: wl_stETH_token, abi: abi.asset, })
    const balance = await api.call({ target: wl_stETH_token, abi: abi.convertToAssets, params: wl_stETH_balance, })
    api.add(unwrappedAsset, balance)
  }
  return balances
}

module.exports = {
  ethereum: {
    tvl,
  },
};
