const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  arbitrum: { vault: '0x8932aA60A7b5EfEFA8Ec3ee899Fd238D029d10c6', fromBlock: 175954437 },
  linea: { vault: '0x03f61a185efEEEFdd3Ba032AFa8A0259337CEd64', fromBlock: 2390784 },
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});

async function tvl(api) {
  const { vault, fromBlock } = config[api.chain];
  const logs = await getLogs({
    api,
    target: vault,
    eventAbi: 'event PairAdded ( address  indexed indexToken,  address  indexed stableToken, address lpToken, uint256 index)',
    onlyArgs: true,
    fromBlock,
  })

  const tokens = logs.map(log => log.indexToken).concat(logs.map(log => log.stableToken))
  tokens.push(ADDRESSES.null)
  return api.sumTokens({ owner: vault, tokens })
}