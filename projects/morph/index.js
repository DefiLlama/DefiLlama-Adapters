const { getConfig } = require('../helper/cache')
const { nullAddress } = require('../helper/tokenMapping')

async function tvl(api) {
  const { tokens } = await getConfig('morph/bridge', 'https://raw.githubusercontent.com/morph-l2/morph-list/main/src/mainnet/tokenList.json')
  const tokensAndOwners = tokens.filter(i => i.chainId === '1').map(i => [i.address, i.gatewayAddress])
  tokensAndOwners.push([nullAddress, '0xDc71366EFFA760804DCFC3EDF87fa2A6f1623304'])
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  ethereum: { tvl },
}