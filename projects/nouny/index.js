// NOUNY (nounyagent.com): no-code trading agents, on-chain payroll and hooked Uniswap v4 pools on Robinhood Chain.
// TVL = what users hold in their own NOUNY vaults:
//   - AgentVaults (one per wallet, live trading agents): every allowed token held by each vault. Vaults are found
//     from the factories' VaultCreated events, and each vault's token list is read on-chain.
//   - PayrollVaults (one per wallet): USDG held for salaries. Listed by the PayrollFactory.
//   - NounyLPVaults (hooked-pool liquidity): idle tokens in each vault plus the amounts in its Uniswap v4 position.
// Both the current and the previous deployment are counted (the previous one was replaced after a security review).
// Source: github.com/nounyagent/nouny-agent
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDG = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'

const AGENT_VAULT_FACTORIES = [
  { address: '0x842dB2d736F66A0132EaB3816C426Bc21bb746Ec', fromBlock: 115989053 }, // current
  { address: '0x0315841Ff9eC63321Faa050e937FD8402053C090', fromBlock: 113701344 }, // previous
]
const PAYROLL_FACTORIES = ['0x5767a297bdc0083684720fc75580d51cB160DccE', '0xeD9cE03E385554Bc829879EBa77cCBC1DeDce5bD']
const LP_VAULT_FACTORIES = ['0x7823d963A7daB90Ae3D2a71415Dc10182D237c44', '0x804a52aDbF958FaAd15884C20A2fFE157A94c6eE']

const abi = {
  vaultCreated: 'event VaultCreated(address indexed owner, address vault)',
  allowedTokens: 'function allowedTokens() view returns (address[])',
  payrollCount: 'uint256:payrollCount',
  payrolls: 'function payrolls(uint256 start, uint256 count) view returns (address[])',
  vaultCount: 'uint256:vaultCount',
  vaults: 'function vaults(uint256 start, uint256 count) view returns (address[])',
  poolKey: 'function poolKey() view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks))',
  positionAmounts: 'function positionAmounts() view returns (uint256 amount0, uint256 amount1)',
}

async function tvl(api) {
  const ownerTokens = []

  // AgentVaults
  const agentVaults = []
  for (const { address, fromBlock } of AGENT_VAULT_FACTORIES) {
    const logs = await getLogs2({ api, target: address, eventAbi: abi.vaultCreated, fromBlock })
    agentVaults.push(...logs.map((l) => l.vault))
  }
  const tokenLists = await api.multiCall({ abi: abi.allowedTokens, calls: agentVaults })
  agentVaults.forEach((vault, i) => ownerTokens.push([tokenLists[i], vault]))

  // PayrollVaults
  // a factory not yet deployed at this block (historical runs) has no code: its count reads as 0
  const payrollCounts = (await api.multiCall({ abi: abi.payrollCount, calls: PAYROLL_FACTORIES, permitFailure: true })).map((n) => n ?? 0)
  const payrollCalls = PAYROLL_FACTORIES.map((target, i) => ({ target, params: [0, payrollCounts[i]] })).filter((c) => +c.params[1] > 0)
  const payrolls = (await api.multiCall({ abi: abi.payrolls, calls: payrollCalls })).flat()
  payrolls.forEach((payroll) => ownerTokens.push([[USDG], payroll]))

  // NounyLPVaults: idle balances plus the position in the hooked pool
  const lpCounts = (await api.multiCall({ abi: abi.vaultCount, calls: LP_VAULT_FACTORIES, permitFailure: true })).map((n) => n ?? 0)
  const lpCalls = LP_VAULT_FACTORIES.map((target, i) => ({ target, params: [0, lpCounts[i]] })).filter((c) => +c.params[1] > 0)
  const lpVaults = (await api.multiCall({ abi: abi.vaults, calls: lpCalls })).flat()
  if (lpVaults.length) {
    const keys = await api.multiCall({ abi: abi.poolKey, calls: lpVaults })
    const positions = await api.multiCall({ abi: abi.positionAmounts, calls: lpVaults })
    lpVaults.forEach((vault, i) => {
      const { currency0, currency1 } = keys[i]
      ownerTokens.push([[currency0, currency1], vault])
      api.add(currency0, positions[i].amount0)
      api.add(currency1, positions[i].amount1)
    })
  }

  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  methodology: 'Tokens held in users\' own NOUNY vaults on Robinhood Chain: AgentVaults used by live trading agents (all allowed tokens), PayrollVaults (USDG held for salaries) and NounyLPVaults (idle tokens plus their Uniswap v4 hooked-pool positions).',
  start: '2026-11-13',
  robinhood: { tvl },
}
