const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

const configs = [
  { factory: "0xF7262C7eb1737f7701130C0151C0697Ad7c7A94D", fromBlock: 63795651 },
]

const tvl = async (api) => {
  const logs = []

  for (const { factory, fromBlock } of configs) {
    console.log(factory, fromBlock)
    logs.push(await getLogs({
      api,
      target: factory,
      topics: ['0x6aea19a4f371dcfa42b8124294d37b93095008d69bd2bacd16067d364acaddae'],
      eventAbi: 'event MarketCreated (address indexed creator, uint256 indexed marketId, address indexed marketAddress, (string, uint256, string, uint256, string[], bool))',
      onlyArgs: true,
      fromBlock,
    }))
  }
  let markets = logs.flat().map(log => log.marketAddress)
  console.log(markets)
  return sumTokens2({ api, owners: markets, token: ADDRESSES.bsc.USDT })
}

module.exports = {
  bsc: {
    tvl,
  }
}
