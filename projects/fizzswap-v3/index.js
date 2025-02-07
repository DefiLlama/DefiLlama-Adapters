const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function v3Tvl(api) {
  const factory = '0x2aeEC787Be499ef6f68e527B64FADF969D048042';
  const WETH = ADDRESSES.silicon_zk.WETH.toLowerCase();

  const fromBlock = 1;
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
      return [[(i.token0.toLowerCase() == WETH) ? ADDRESSES.null : i.token0, i.token1], i.pool]
    }),
  })
}

module.exports = {
  silicon_zk: {
    tvl: v3Tvl,
  },
}