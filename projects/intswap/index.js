const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: '0x46531ea0E7cec64b14181d45F8C6798a1cE45da1',
    topics: ['0x3211d27a1A1B8E40C7974F6951935303e6e56DBE'], // NewPair event
    onlyArgs: true,
    fromBlock: 9675402,
  })

  await api.sumTokens({ owners: logs.map(i => '0x' + i.data.slice(-40)), tokens: [ADDRESSES.null] })
  const bal = api.getBalances()
  api.add(ADDRESSES.null, bal[api.chain + ':'+ADDRESSES.null ?? 0])
  return bal
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Sum up all the ETH in pools',
  era: { tvl, }
}
