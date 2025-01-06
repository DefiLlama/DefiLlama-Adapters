const { getLogs } = require('../helper/cache/getLogs')

const DEGATE_DEPOSIT_CONTRACT = '0x54d7ae423edb07282645e740c046b9373970a168';
const DEGATE_EXCHANGE_CONTRACT = '0x9C07A72177c5A05410cA338823e790876E79D73B';

const START_BLOCK = 18552105;

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: DEGATE_EXCHANGE_CONTRACT,
    eventAbi: 'event TokenRegistered (address token, uint32  tokenId)',
    onlyArgs: true,
    fromBlock: START_BLOCK,
  })
  return api.sumTokens({ tokens: logs.map((log) => log.token), owner: DEGATE_DEPOSIT_CONTRACT, blacklistedTokens: ['0x53C8395465A84955c95159814461466053DedEDE'] })
}

module.exports = {
  start: '2023-11-12', // Nov-11-2023 11:56:23 PM +UTC
  ethereum: { tvl }
}
