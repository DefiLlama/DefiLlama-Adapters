const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

// ConfidentialPool: ETH wrapped into confidential notes on Ethereum.
const CONFIDENTIAL_POOL = '0x000000000Ed1eabD231Be41d93b719056F7febFC'
// TacitEvmPool: the shielded ETH pool, deployed at the same address on Ethereum, Base and Robinhood Chain.
const EVM_POOL = '0x000000c2A20657CE25f2Ba99737933D031AFBEE9'

const eth = (owners) => ({ tvl: sumTokensExport({ owners, tokens: [ADDRESSES.null] }) })

module.exports = {
  methodology: 'TVL is the ETH held by Tacit\'s shielded pools: the ETH wrapped into the ConfidentialPool on Ethereum, and the ETH shielded in the TacitEvmPool on Ethereum, Base and Robinhood Chain. Balances are read from the pool contracts.',
  start: '2026-09-17',
  ethereum: eth([CONFIDENTIAL_POOL, EVM_POOL]),
  base: eth([EVM_POOL]),
  robinhood: eth([EVM_POOL]),
}
