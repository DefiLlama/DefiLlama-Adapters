const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

const FACTORY = '0xeF72cbCcF4A807DfA1fbecd61DdB488fF8a05fa3'
const ALM_VAULT_FACTORY = '0x8d8535C8842Aa541fcB3F6CC436e1b3A816a3a0e'
const FROM_BLOCK = 26521466

const STANDARD_POOL_CREATED = 'event Pool(address indexed token0, address indexed token1, address pool)'
const CUSTOM_POOL_CREATED = 'event CustomPool(address indexed deployer, address indexed token0, address indexed token1, address pool)'
const ALM_VAULT_CREATED =
  'event ALMVaultCreated(address indexed sender, address almVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint256 count)'

async function tvl(api) {
  const [standardPools, customPools, almVaults] = await Promise.all([
    getLogs2({ api, target: FACTORY, eventAbi: STANDARD_POOL_CREATED, fromBlock: FROM_BLOCK, extraKey: 'pool' }),
    getLogs2({ api, target: FACTORY, eventAbi: CUSTOM_POOL_CREATED, fromBlock: FROM_BLOCK, extraKey: 'custom-pool' }),
    getLogs2({ api, target: ALM_VAULT_FACTORY, eventAbi: ALM_VAULT_CREATED, fromBlock: FROM_BLOCK }),
  ])

  const owners = new Map()
  for (const { token0, token1, pool } of [...standardPools, ...customPools])
    owners.set(pool.toLowerCase(), [[token0, token1], pool])
  
  for (const { almVault, tokenA, tokenB } of almVaults)
    owners.set(almVault.toLowerCase(), [[tokenA, tokenB], almVault])

  return sumTokens2({ api, ownerTokens: [...owners.values()] })
}

module.exports = {
  start: '2026-05-13',
  methodology:
    'TVL is the token0/token1 balances held by every standard and custom pool created by the SwitchX factory on PulseChain, plus the idle underlying token balances held by SwitchX ALM vaults. Pools and vaults are discovered from the factory creation events. ALM position liquidity is already custodied by the pools, so vault receipt tokens, farming positions, ve-locked SWITCH, rewards and treasury balances are excluded to avoid double counting.',
  pulse: { tvl },
   }
