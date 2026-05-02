const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const STASH_FACTORY = '0x000000000000A6fA31F5fC51c1640aAc76866750'
const WETH = ADDRESSES.ethereum.WETH
const ETH = ADDRESSES.null

const DEPLOYED_ABI = 'event Deployed(address indexed proxy, address indexed implementation)'

const tvl = async (api) => {
  const logs = await getLogs2({ api, target: STASH_FACTORY, eventAbi: DEPLOYED_ABI, fromBlock: 19000000, onlyArgs: true })
  const owners = logs.map(log => log.proxy)
  return sumTokens2({ api, owners, tokens: [ETH, WETH], permitFailure: true })
}

module.exports =  {
  ethereum : { tvl }
}
