const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0x69Be606be7Fd2d27C8f9821329c748c77d24FF4f'
const FROM_BLOCK = 2189672
const USDnR = '0xD48e565561416dE59DA1050ED70b8d75e8eF28f9'.toLowerCase()

module.exports = {
  methodology: 'TVL counts liquidity locked in FluxFlow V3 pools on Fluent. PoolCreated events are read from the factory and reserves of each pool are summed. USDnR balances are remapped to USDC (1:1 USD peg).',
  fluent: {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: FACTORY,
        topics: ['0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118'],
        fromBlock: FROM_BLOCK,
        eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
        onlyArgs: true,
      })

      await sumTokens2({
        api,
        ownerTokens: logs.map(i => [[i.token0, i.token1], i.pool]),
        permitFailure: true,
      })

      const balances = api.getBalances()
      const usdnrKey = `fluent:${USDnR}`
      const usdnrBal = balances[usdnrKey]
      if (usdnrBal) {
        delete balances[usdnrKey]
        api.add(`ethereum:${ADDRESSES.ethereum.USDC}`, usdnrBal, { skipChain: true })
      }
    },
  },
}
