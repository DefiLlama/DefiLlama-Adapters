const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: '0xc25e230afb1b67162350cd405add199a002c6abd',
    topics: ['0x0838512b7934222cec571cf3fde1cf3e9e864bbc431bd5d1ef4d9ed3079093d9'],
    fromBlock: 59965885,
    eventAbi: 'event NewSwapPool (address indexed deployer, address swapAddress, address[] pooledTokens)',
    onlyArgs: true,
  })
  return sumTokens2({ api, ownerTokens: logs.map(i => ([i.pooledTokens, i.swapAddress]))})
}

module.exports = {
  arbitrum: {
    tvl
  }
};
