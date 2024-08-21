const { getLogs2, getAddress } = require('../helper/cache/getLogs')
async function tvl(api) {
  const logs = await getLogs2({
    api,
    factory:'0xA8a7e295c19b7D9239A992B8D9C053917b8841C6',
    fromBlock: 20518021,
    topics: ['0x15fc3a903a61f172517fb952e6bd117215850f3dbfb9de008591509754dabf59']
  })
  const nfts = logs.map(log => getAddress(log.topics[3]))
  return api.sumTokens({ owner: '0xc2e257476822377dfb549f001b4cb00103345e66', tokens: nfts})
}

module.exports = {
  ethereum: {
    tvl,
  },
  methodology:
    "TVL is calculated by summing the value of underlying NFTs of the delegation tokens owned by MetaStreet Airdrop Pass Factory."
};
