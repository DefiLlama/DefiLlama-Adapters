const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  arbitrum: { vault: ['0x8932aA60A7b5EfEFA8Ec3ee899Fd238D029d10c6', '0xfE47bD50f27c2C876Dd1B92A26dF3A5A5E65636C'], fromBlock: 175954437 },
  linea: { vault: ['0x03f61a185efEEEFdd3Ba032AFa8A0259337CEd64', '0x81398D55d9e58D9b528FdC38911851Fb1D5C2d45'], fromBlock: 2390784 },
  op_bnb: { vault: ['0xCB9724cf580C09f3Cd7391F7fE20b5BF9cC4C428', '0x685830C647A8554c5db7CcC9c1C7d86dfA0A2592'], fromBlock: 35581884 },
  bsc: { vault: ['0x22cEc08111BBae24D0b80BDA2a6503EaB9BA704b', '0xD986676EB65bFDB3160303f81FB81607a055c7Bd'], fromBlock: 47537511 },
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