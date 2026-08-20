const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0xeF72cbCcF4A807DfA1fbecd61DdB488fF8a05fa3'
const ALM_VAULT_FACTORY = '0x8d8535C8842Aa541fcB3F6CC436e1b3A816a3a0e'
const FACTORY_FROM_BLOCK = 26521466

const STANDARD_POOL_CREATED = 'event Pool(address indexed token0, address indexed token1, address pool)'
const CUSTOM_POOL_CREATED = 'event CustomPool(address indexed deployer, address indexed token0, address indexed token1, address pool)'
const ALM_VAULT_CREATED =
  'event ALMVaultCreated(address indexed sender, address almVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint256 count)'

async function tvl(api) {
  const [standardPools, customPools, almVaults] = await Promise.all([
    getLogs({
      api,
      target: FACTORY,
      fromBlock: FACTORY_FROM_BLOCK,
      eventAbi: STANDARD_POOL_CREATED,
      onlyArgs: true,
      // Both event types come from the same factory, so they need distinct
      // cache keys to prevent one decoded event set from shadowing the other.
      extraKey: 'standard-pools',
    }),
    getLogs({
      api,
      target: FACTORY,
      fromBlock: FACTORY_FROM_BLOCK,
      eventAbi: CUSTOM_POOL_CREATED,
      onlyArgs: true,
      extraKey: 'custom-pools',
    }),
    getLogs({
      api,
      target: ALM_VAULT_FACTORY,
      fromBlock: FACTORY_FROM_BLOCK,
      eventAbi: ALM_VAULT_CREATED,
      onlyArgs: true,
    }),
  ])

  const owners = new Map()
  for (const { token0, token1, pool } of [...standardPools, ...customPools]) {
    owners.set(pool.toLowerCase(), { token0, token1, owner: pool })
  }
  // ALM liquidity positions are already included in pool balances. Only the
  // vaults' idle underlying balances are additional TVL, so count their
  // token0/token1 balances without valuing vault shares or NFT positions.
  for (const { almVault, tokenA, tokenB } of almVaults) {
    owners.set(almVault.toLowerCase(), { token0: tokenA, token1: tokenB, owner: almVault })
  }

  return sumTokens2({
    api,
    ownerTokens: [...owners.values()].map(({ token0, token1, owner }) => [[token0, token1], owner]),
    // Standard pool creation is permissionless. Isolate non-compliant or
    // reverting ERC-20 balanceOf calls so one hostile pool cannot break TVL.
    permitFailure: true,
  })
}

module.exports = {
  start: '2026-05-13',
  methodology:
    'TVL is the value of token0 and token1 balances held by every standard and custom concentrated-liquidity pool created by the canonical SwitchX factory on PulseChain, plus idle underlying token balances held directly by canonical SwitchX ALM vaults. ALM position liquidity is already custodied by the pools, so vault receipt tokens, farming positions, ve-locked SWITCH, rewards, treasury balances, and other protocol-owned assets are excluded to avoid double counting.',
  pulse: { tvl },
}
