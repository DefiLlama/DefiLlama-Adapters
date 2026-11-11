const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const CL = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)'
const BIN = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint24 activeId)'

const config = {
  anubi: { vault: '0x080afe8C30e48e126e9EFAd6F455BaF53c16Ec91', clPoolManager: '0xC85Edc14Fc6053151066f6D497B11E6982946a50', binPoolManager: '0x4f5c8F759912BbcE685B2315136615Bb13DDe509', fromBlock: 18483713, start: '2026-11-07' },
  robinhood: { vault: '0x90c882D9C307c2bF7E961bC279b0929f92997dD4', clPoolManager: '0x6D0721230b6beD4bc9eeb65E200B6f90c2C9aEE6', binPoolManager: '0x4255B0B14F3dd4e2350954Da78707E3fA6c94E2B', fromBlock: 109466287, start: '2026-11-08' },
  base: { vault: '0x90c882D9C307c2bF7E961bC279b0929f92997dD4', clPoolManager: '0x6D0721230b6beD4bc9eeb65E200B6f90c2C9aEE6', binPoolManager: '0x4255B0B14F3dd4e2350954Da78707E3fA6c94E2B', fromBlock: 54386424, start: '2026-11-07' },
  bsc: { vault: '0x90c882D9C307c2bF7E961bC279b0929f92997dD4', clPoolManager: '0x6D0721230b6beD4bc9eeb65E200B6f90c2C9aEE6', binPoolManager: '0x4255B0B14F3dd4e2350954Da78707E3fA6c94E2B', fromBlock: 132456409, start: '2026-11-08' },
  elysium: { vault: '0x90c882D9C307c2bF7E961bC279b0929f92997dD4', clPoolManager: '0x6D0721230b6beD4bc9eeb65E200B6f90c2C9aEE6', binPoolManager: '0x4255B0B14F3dd4e2350954Da78707E3fA6c94E2B', fromBlock: 2834807, start: '2026-11-09' },
}

module.exports = {
  methodology: 'Gully Core is a singleton AMM: one Vault holds the tokens of every pool. TVL is the Vault balance of every currency initialized in the CL and Bin pool managers.',
}

Object.keys(config).forEach(chain => {
  const { vault, clPoolManager, binPoolManager, fromBlock, start } = config[chain]
  module.exports[chain] = {
    start,
    tvl: async (api) => {
      const tokens = []
      for (const [target, eventAbi] of [[clPoolManager, CL], [binPoolManager, BIN]]) {
        const logs = await getLogs2({ api, target, fromBlock, eventAbi })
        logs.forEach(l => tokens.push(l.currency0, l.currency1))
      }
      return sumTokens2({ api, owner: vault, tokens, permitFailure: true })
    },
  }
})
