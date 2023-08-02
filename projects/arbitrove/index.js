const { getLogs } = require('../helper/cache/getLogs');
const { nullAddress, } = require('../helper/unwrapLPs');
const ALP_TOKEN = '0xb49B6A3Fd1F4bB510Ef776de7A88A9e65904478A';

async function tvl(_, _b, _cb, { api }) {
  const logs = await getLogs({
    api,
    target: ALP_TOKEN,
    topic: 'SetCoinCap(address,uint256)',
    eventAbi: 'event SetCoinCap(address indexed coin, uint256 indexed cap)',
    onlyArgs: true,
    fromBlock: 67635825,
  })
  return api.sumTokens({ owners: [ALP_TOKEN], tokens: [nullAddress, ...logs.map(l => l.coin)]})
}

module.exports = {
  arbitrum: {
    tvl,
  }
}