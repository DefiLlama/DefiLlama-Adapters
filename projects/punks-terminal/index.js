const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const STASH_FACTORY = '0x000000000000A6fA31F5fC51c1640aAc76866750'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const ETH = '0x0000000000000000000000000000000000000000'

const DEPLOYED_ABI = 'event Deployed(address indexed proxy, address indexed implementation)'

const tvl = async (api) => {
  const logs = await getLogs2({ api, target: STASH_FACTORY, eventAbi: DEPLOYED_ABI, fromBlock: 19000000, onlyArgs: true })
  const owners = logs.map(log => log.proxy)
  return sumTokens2({ api, owners, tokens: [ETH, WETH], permitFailure: true })
}

module.exports =  {
  ethereum : { tvl }
}
