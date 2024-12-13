const { getLogs } = require('../helper/cache/getLogs')

const factory = '0xFD1353baBf86387FcB6D009C7b74c1aB2178B304'
const fromBlock = '29080112'

const tvl = async (api) => {
  const logs = await getLogs({
    api,
    target: factory,
    eventAbi: 'event FundCreated (address indexed newFund, address comptroller, address shareToken, address vault)',
    onlyArgs: true,
    fromBlock,
  })

  const tokens = await api.multiCall({  abi: 'address[]:getAssetList', calls: logs.map(l => l.newFund) })
  const ownerTokens = tokens.map((t, i) => [t, logs[i].vault])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  deadFrom: '2024-12-09',
  polygon : { tvl : () => ({}) } 
}
