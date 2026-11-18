const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokensExport } = require('../helper/unwrapLPs')

// ConfidentialPool: ETH, USDC, USDT and wstETH wrapped into confidential notes on Ethereum.
const CONFIDENTIAL_POOL = '0x000000000Ed1eabD231Be41d93b719056F7febFC'
// TacitEvmPool: the shielded ETH pool, deployed at the same address on Ethereum, Base and Robinhood Chain.
const EVM_POOL = '0x000000c2A20657CE25f2Ba99737933D031AFBEE9'
// CollateralEngine: the wstETH escrow behind Bitcoin locks. It posts an EscrowPosted event for each lock.
const COLLATERAL_ENGINE = '0x000000003f608BDdF0ca45934003ffb9DbDF70DB'
const FROM_BLOCK = 25998000

const escrowPosted = 'event EscrowPosted(bytes32 indexed outpoint, address indexed from, uint256 amount)'
const lockAbis = {
  sats: 'function cbtcLockVBtc(bytes32) view returns (uint64)',
  spent: 'function cbtcLockSpent(bytes32) view returns (bool)',
  redeemed: 'function cbtcLockRedeemed(bytes32) view returns (bool)',
}

// BTC locked on Bitcoin behind cBTC: each lock's sats are proven and recorded on Ethereum by the pool. A lock that has
// been spent on Bitcoin or redeemed no longer counts.
async function bitcoinLocks(api) {
  const logs = await getLogs({ api, target: COLLATERAL_ENGINE, eventAbi: escrowPosted, onlyArgs: true, fromBlock: FROM_BLOCK })
  const outpoints = [...new Set(logs.map((l) => l.outpoint))]
  if (!outpoints.length) return
  const [sats, spent, redeemed] = await Promise.all(
    Object.values(lockAbis).map((abi) => api.multiCall({ abi, target: CONFIDENTIAL_POOL, calls: outpoints }))
  )
  const locked = outpoints.reduce((sum, _, i) => (spent[i] || redeemed[i] ? sum : sum + BigInt(sats[i])), 0n)
  api.addCGToken('bitcoin', Number(locked) / 1e8)
}

async function ethereumTvl(api) {
  await api.sumTokens({
    owners: [CONFIDENTIAL_POOL, EVM_POOL, COLLATERAL_ENGINE],
    tokens: [ADDRESSES.null, ADDRESSES.ethereum.WSTETH, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT],
  })
  await bitcoinLocks(api)
}

const eth = (owners) => ({ tvl: sumTokensExport({ owners, tokens: [ADDRESSES.null] }) })

module.exports = {
  methodology: 'TVL is the assets held by Tacit\'s contracts: the ETH, USDC, USDT and wstETH wrapped into the ConfidentialPool on Ethereum, the ETH shielded in the TacitEvmPool on Ethereum, Base and Robinhood Chain, and the wstETH escrowed in the CollateralEngine that backs Bitcoin locks. It also counts the BTC locked on Bitcoin behind cBTC, as proven and recorded on the ConfidentialPool; cBTC and cUSD are not added, they are claims on those locks. Tacit\'s own token (TAC) is not counted.',
  start: '2026-09-17',
  ethereum: { tvl: ethereumTvl },
  base: eth([EVM_POOL]),
  robinhood: eth([EVM_POOL]),
}
