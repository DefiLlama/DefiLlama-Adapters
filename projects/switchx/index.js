const sdk = require('@defillama/sdk')
const { uniV3Export } = require('../helper/uniswapV3')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

const FACTORY = '0xeF72cbCcF4A807DfA1fbecd61DdB488fF8a05fa3'
const ALM_VAULT_FACTORY = '0x8d8535C8842Aa541fcB3F6CC436e1b3A816a3a0e'
const FROM_BLOCK = 26521466

const ALM_VAULT_CREATED = 'event ALMVaultCreated(address indexed sender, address almVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint256 count)'

const poolsTvl = uniV3Export({
  pulse: { factory: FACTORY, fromBlock: FROM_BLOCK, isAlgebra: true },
})

async function almVaultTvl(api) {
  const vaults = await getLogs2({ api, target: ALM_VAULT_FACTORY, eventAbi: ALM_VAULT_CREATED, fromBlock: FROM_BLOCK })
  return sumTokens2({
    api,
    ownerTokens: vaults.map(({ almVault, tokenA, tokenB }) => [[tokenA, tokenB], almVault]),
  })
}

module.exports = {
  start: '2026-05-13',
  methodology:
    'TVL is the token0/token1 balances held by every pool created by the SwitchX factory on PulseChain, plus the idle underlying token balances held by SwitchX ALM vaults. ALM position liquidity is already custodied by the pools, so vault receipt tokens, farming positions, ve-locked SWITCH, rewards and treasury balances are excluded to avoid double counting.',
  pulse: { tvl: sdk.util.sumChainTvls([poolsTvl.pulse.tvl, almVaultTvl]) },
}
