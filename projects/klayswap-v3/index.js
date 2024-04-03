const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function v3Tvl(api) {
  const factory = '0xA15Be7e90df29A4aeaD0C7Fc86f7a9fBe6502Ac9';
  const wklay = '0x19aac5f612f524b754ca7e7c41cbfa2e981a4432';
  const klay = ADDRESSES.null;

  const fromBlock = 124342981;
  const eventAbi = 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool, uint256 exid)';
  const topics = [
    '0x20a108faf9dc51ca2b459a109d08568e65a9cb87569b6b3a334c275d504ff94f',
  ];

  const logs = await getLogs({
    api,
    target: factory,
    topics,
    fromBlock,
    eventAbi,
    onlyArgs: true,
  })

  return sumTokens2({
    api, ownerTokens: logs.map(i => {
      return [[(i.token0.toLowerCase() == wklay) ? klay : i.token0, i.token1], i.pool]
    }),
  })
}

module.exports = {
  klaytn: {
    tvl: v3Tvl,
  },
}