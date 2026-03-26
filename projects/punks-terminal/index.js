const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const STASH_FACTORY = '0x000000000000A6fA31F5fC51c1640aAc76866750'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const ETH = '0x0000000000000000000000000000000000000000'

module.exports = {
  methodology: 'TVL is the sum of ETH and WETH held across all Stash contracts deployed via the Stash Factory.',
  ethereum: {
    tvl: async (api) => {
      const logs = await getLogs2({
        api,
        target: STASH_FACTORY,
        eventAbi: 'event Deployed(address indexed proxy, address indexed implementation)',
        fromBlock: 19000000,
      })
      const stashAddresses = logs.map(log => log.proxy)
      const tokensAndOwners = stashAddresses.flatMap(stash => [
        [ETH, stash],
        [WETH, stash],
      ])
      return sumTokens2({ api, tokensAndOwners, permitFailure: true })
    }
  }
}
