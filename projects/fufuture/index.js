const { getLogs2, getAddress, } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(api) {
  const { factory, fromBlock, optionsTrade } = config[api.chain]
  const privateLogs = await getLogs2({ api, factory, fromBlock, extraKey: 'private-pool', topics: ['0x321e5276dc2982b3e95825088a15cf891d1f691c70b6236b506afa3810ec0297'] })
  const publicLogs = await getLogs2({ api, factory, fromBlock, extraKey: 'public-pool', topics: ['0x53aad570e9fba02f275a68e410f634e241c8301d036a94761d71bcba65941a36'] })
  const logs = privateLogs.concat(publicLogs)
  const ownerTokens = []
  const allTokens = []
  logs.forEach(({ topics }) => {
    const token = getAddress(topics[2])
    const pool = getAddress(topics[3])
    ownerTokens.push([[token], pool])
    allTokens.push(token)
  })
  ownerTokens.push([allTokens, optionsTrade])
  return sumTokens2({ api, ownerTokens, permitFailure: true })
}

module.exports = {
  methodology: "The world's first decentralized currency standard Perpetual options Transaction agreement",
};

const config = {
  bsc: { factory: '0x0CB5274a8Ff86b7b750933B09aba8B5eb3660977', fromBlock: 33366630, optionsTrade: '0x1e933E0957e6236E519e64CD13f967146Fcb4755' },
  arbitrum: { factory: '0x0CB5274a8Ff86b7b750933B09aba8B5eb3660977', fromBlock: 162984841, optionsTrade: '0x1e933E0957e6236E519e64CD13f967146Fcb4755' },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})