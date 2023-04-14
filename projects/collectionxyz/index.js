const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const factory = '0x03b51826a4868780db375ee27e5b0adaac5274ee'

async function tvl(_, _b, _cb, { api, }) {
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0x77948cb83ef3caff9ac13dfab1ea1f8a6875c98370287ce587f5dbc74cc5b6b0'],
    eventAbi: 'event NewPool (address indexed collection, address indexed poolAddress)',
    onlyArgs: true,
    fromBlock: 16932638,
  })
  api.log('Pool length: ', logs.length)
  const tokensAndOwners = logs.map(i => [[i.collection, i.poolAddress], [nullAddress, i.poolAddress]]).flat()
  return sumTokens2({ api, tokensAndOwners})
  
}
module.exports = {
  start: 16945809,
  ethereum: {
    tvl,
  },
};
