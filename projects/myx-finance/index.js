const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  arbitrum: {
    factories: [{ vault: '0x8932aA60A7b5EfEFA8Ec3ee899Fd238D029d10c6', fromBlock: 175954437 },],
    hypeVaults: ['0xfE47bD50f27c2C876Dd1B92A26dF3A5A5E65636C',],
  },
  linea: {
    factories: [{ vault: '0x03f61a185efEEEFdd3Ba032AFa8A0259337CEd64', fromBlock: 2390784 },],
    hypeVaults: ['0x81398D55d9e58D9b528FdC38911851Fb1D5C2d45',],
  },
  op_bnb: {
    factories: [{ vault: '0xCB9724cf580C09f3Cd7391F7fE20b5BF9cC4C428', fromBlock: 35581884 },],
    hypeVaults: ['0x685830C647A8554c5db7CcC9c1C7d86dfA0A2592',],
  },
  bsc: {
    factories: [{ vault: '0x22cEc08111BBae24D0b80BDA2a6503EaB9BA704b', fromBlock: 47537511 },],
    hypeVaults: ['0xD986676EB65bFDB3160303f81FB81607a055c7Bd',],
  },
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});

async function tvl(api) {
  const { factories, hypeVaults } = config[api.chain];
  const ownerTokens = []
  for (const { vault, fromBlock } of factories) {

    const logs = await getLogs({
      api,
      target: vault,
      eventAbi: 'event PairAdded ( address  indexed indexToken,  address  indexed stableToken, address lpToken, uint256 index)',
      onlyArgs: true,
      fromBlock,
    })

    let tokens = logs.map(log => log.indexToken).concat(logs.map(log => log.stableToken))
    tokens.push(ADDRESSES.null)
    ownerTokens.push([tokens, vault])
  }
  const hypeTokens = await api.multiCall({ abi: 'address[]:getAcceptableAssets', calls: hypeVaults })
  ownerTokens.push(...hypeTokens.map((tokens, i) => [tokens, hypeVaults[i]]))
  return api.sumTokens({ ownerTokens })
}