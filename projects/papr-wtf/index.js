const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(api) {

  const controller = '0x3b29c19ff2fcea0ff98d0ef5b184354d74ea74b0'
  const logs = await getLogs({
    api,
    target: controller,
    topic: 'AllowCollateral(address,bool)',
    eventAbi: 'event AllowCollateral(address indexed collateral, bool isAllowed)',
    onlyArgs: true,
    fromBlock: 16592385,
  })
  return sumTokens2({ api, owner: controller, tokens: logs.map(i => i.collateral)})
}

module.exports = {
  ethereum: { tvl }
}
