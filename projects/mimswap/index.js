const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  arbitrum: { factory: '0x8D0Cd3eEf1794F59F2B3a664Ef07fCAD401FEc73', fromBlock: 205217727 },
  ethereum: { factory: '0xDF46F6b1a5F794F21eaD4008C7De4E02Dc045297', fromBlock: 20537337 },
  blast: { factory: '0x7E05363E225c1c8096b1cd233B59457104B84908', fromBlock: 1067907 },
  kava: { factory: '0x7Ad0e580d8458BbeF71EC6A1755c59651E1EAaa7', fromBlock: 10023543 },
  nibiru: { factory: '0xD6b8bd85A9593cb47c8C15C95bbF3e593c5Dc591', fromBlock: 23108400 },
}

const PoolCreatedEvent = 'event LogPoolAdded (address baseToken, address quoteToken, address creator, address pool)'
const LogCreatedEvent = 'event LogCreated(address pool, address indexed baseToken,address indexed quoteToken, address indexed creator, address creatorOrigin, uint256 lpFeeRate, uint256 i,uint256 k)'

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: api.chain === 'nibiru' ? LogCreatedEvent : PoolCreatedEvent, fromBlock })
      const ownerTokens = logs.map(log => [[log.baseToken, log.quoteToken], log.pool])
      return api.sumTokens({ ownerTokens })
    }
  }
})