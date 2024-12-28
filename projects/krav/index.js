const { getLogs } = require('../helper/cache/getLogs')
const { sumTokensExport } = require('../helper/unwrapLPs')

const KRAV = '0xbe3111856e4aca828593274ea6872f27968c8dd6'
const config = {
  base: { factory: '0xFfD88F38025e02f9d2eB7F0875060F6B4a20980a', fromBlock: 2300044, KRAV: '0xbe3111856e4aca828593274ea6872f27968c8dd6', kravPool: '0x3e558c2378aa7d405b2ed67f510d390bcdbf4d96' },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, KRAV, kravPool } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x5c81c71af616b8773a312ce82b16990e78cb55072a05427bc7fb08bbae50959d'],
        eventAbi: 'event QuantoCreated(uint256, int256, address token, address, address, address, address, address, address, address pool, address)',
        onlyArgs: true,
        fromBlock,
      })
      return api.sumTokens({ tokensAndOwners: logs.map(i => [i.token, i.pool]), blacklistedTokens: [KRAV] })
    }
  }
  if (kravPool)
    module.exports[chain].staking = sumTokensExport({ owner: kravPool, tokens: [KRAV]})
})


