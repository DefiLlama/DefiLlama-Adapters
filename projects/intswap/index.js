const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: '0xb9a8213d237c768e88bf89d690a9222df439dcc1',
    topics: ['0xbc9687dc21b69bf8e01370b9f0ae1625f6bf5244fc230fa3ad4c06350deb634d'], // NewPair event
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
