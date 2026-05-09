const { sumTokens2 } = require('../helper/unwrapLPs')

const CONTROLLER = '0x1746484EA5e11C75e009252c102C8C33e0315fD4'
const HOOK = '0x0000000aa232009084Bd71A5797d089AA4Edfad4'

const tvl = async (api) => {
  const total = Number(await api.call({ target: CONTROLLER, abi: 'uint256:totalPools' }))
  const calls = Array.from({ length: total }, (_, i) => ({ target: CONTROLLER, params: [i] }))
  const pools = await api.multiCall({
    abi: 'function getPoolByIndex(uint256) view returns (address asset0, address asset1)',
    calls,
  })
  const tokens = [...new Set(pools.flatMap(p => [p.asset0, p.asset1]))]
  return sumTokens2({ api, owner: HOOK, tokens })
}

module.exports = {
  doublecounted: true,
  methodology: "Counts the underlying tokens custodied by the Angstrom hook contract on Uniswap v4. Active Angstrom pools are enumerated on-chain via the ControllerV1 registry (totalPools/getPoolByIndex). LP-deposited liquidity routed through Angstrom pools sits in the Uniswap v4 PoolManager and is already counted under the uniswap-v4 protocol entry; this adapter only attributes the hook's own custody to avoid double-counting.",
  ethereum: { tvl },
}
