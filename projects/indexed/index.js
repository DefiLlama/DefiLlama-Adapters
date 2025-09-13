const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
async function tvl(api) {
  const logs = await getLogs({
    api,
    target: '0x592f70cE43a310D15fF59BE1460F38Ab6DF3Fe65',
    topics: ['0x3c9399222fcd8c810cad2570e37d7b31aed4013fbfb296e5de17c0935d4159e7'],
    eventAbi: 'event NewPool (address pool, address controller, bytes32 implementationID)',
    onlyArgs: true,
    fromBlock: 11371951,
  })
  const pools = logs.map(i => i.pool)
  const tokens = await api.multiCall({ abi: 'address[]:getCurrentTokens', calls: pools })
  return sumTokens2({ api, ownerTokens: pools.map((v, i) => [tokens[i], v]) })
}

module.exports = {
  ethereum: { tvl },
  hallmarks: [
    // ['2021-10-14', 'Protocol was hacked'],
    ['2023-03-20', 'Balancing arbitrage'],
  ],
}