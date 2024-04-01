const { getCache, } = require('../helper/http')
const sdk = require('@defillama/sdk')

const chainMapping = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
}

function getDChain(chain) {
  return chainMapping[chain]
}

async function tvl(_, _1, _2, { api }) {
  const lendingModule = await getCache('https://thornode.ninerealms.com/thorchain/balance/module/lending')

  const aChain = api.chain

  const balances = {}

  lendingModule.coins.map(({ denom, amount = 0 }) => {
    let [, asset] = denom.split('.')
    let chain = chainMapping[asset.toUpperCase()]
    const dChain = getDChain(asset.toUpperCase())
    if (dChain !== aChain) return;
    sdk.util.sumSingleBalance(balances, chain, amount / 1e8)
  })

  return balances
}

module.exports = {
  hallmarks: [
    [1626656400, "Protocol paused"],
    [1631754000, "Protocol resumed"],
  ],
  timetravel: false,
  thorchain: { tvl },
}

Object.keys(chainMapping).map(getDChain).forEach(chain => {
  module.exports[chain] = {tvl}
})
