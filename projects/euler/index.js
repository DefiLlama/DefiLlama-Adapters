const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')


module.exports = {
  hallmarks: [[1654387200, "Whale Deposit"],
  [1667865600, "FTX collapse"],
  [Math.floor(new Date('2023-03-13') / 1e3), 'Protocol was hacked'],],
  methodology: `TVL is supply balance minus borrows the euler contract. Borrows are pulled from the subgraph.`,
  ethereum: {
    tvl, 
    borrowed: () => 0,
  },
};

async function tvl(api) {
  const EULER = '0x27182842e098f60e3d576794a5bffb0777e025d3'
  const logs = await getLogs({
    api,
    target: EULER,
    topics: ['0x2ece124509c63be11a6985ae00b93c8cb8f8d8898f6e5239fc9e38bc71909667'],
    fromBlock: 13687582,
    eventAbi: 'event MarketActivated (address indexed underlying, address indexed eToken, address indexed dToken)',
    onlyArgs: true,
  })

  return sumTokens2({ api, owner: EULER, tokens: logs.map(i => i.underlying)})
}

async function borrowed(api) {
  const EULER = '0x27182842e098f60e3d576794a5bffb0777e025d3'
  const logs = await getLogs({
    api,
    target: EULER,
    topics: ['0x2ece124509c63be11a6985ae00b93c8cb8f8d8898f6e5239fc9e38bc71909667'],
    fromBlock: 13687582,
    eventAbi: 'event MarketActivated (address indexed underlying, address indexed eToken, address indexed dToken)',
    onlyArgs: true,
  })
  const bals = await api.multiCall({  abi: 'erc20:totalSupply', calls: logs.map(i => i.dToken)})
  api.addTokens(logs.map(i => i.underlying.toLowerCase()), bals)
  delete api.getBalances()["ethereum:0x31c8eacbffdd875c74b94b077895bd78cf1e64a3"]
}
