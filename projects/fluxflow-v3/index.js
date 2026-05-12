const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0x69Be606be7Fd2d27C8f9821329c748c77d24FF4f'
const FROM_BLOCK = 2189672
const USDnR = '0xD48e565561416dE59DA1050ED70b8d75e8eF28f9'.toLowerCase()
const sUSDnR = '0xfa9b3b45587f9fcde14759121c3868c2733dcbf4'.toLowerCase()
const VAULT = '0x50ae83dbdc44208eda1ef722f87bab0ffb195eea'

module.exports = {
  methodology: 'TVL counts liquidity locked in FluxFlow V3 pools on Fluent. PoolCreated events are read from the factory and reserves of each pool are summed. USDnR is remapped to USDC (1:1 USD peg). sUSDnR (vault share) is converted to USDnR via the vault `getSharePrice()` then priced as USDC.',
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

      // USDnR (6 decimals) → USDC 1:1
      const usdnrKey = `fluent:${USDnR}`
      if (balances[usdnrKey]) {
        const bal = balances[usdnrKey]
        delete balances[usdnrKey]
        api.add(`ethereum:${ADDRESSES.ethereum.USDC}`, bal, { skipChain: true })
      }

      // sUSDnR (6 decimals) → USDnR via vault getSharePrice (1e6 scale) → USDC
      const susdnrKey = `fluent:${sUSDnR}`
      if (balances[susdnrKey]) {
        const sharePrice = await api.call({ abi: 'uint256:getSharePrice', target: VAULT })
        const bal = balances[susdnrKey]
        delete balances[susdnrKey]
        const usdValue = (BigInt(bal) * BigInt(sharePrice)) / 10n ** 6n
        api.add(`ethereum:${ADDRESSES.ethereum.USDC}`, usdValue.toString(), { skipChain: true })
      }
    },
  },
}
