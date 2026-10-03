const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

// Nullmask shielded pool (ERC1967 proxy), Ethereum mainnet
const POOL = '0xd64EF1417EB047ed0b54736a5a41F01178C391c6'
const FROM_BLOCK = 26097579 // proxy deployment
const TOKENS = [ADDRESSES.null, ADDRESSES.ethereum.USDT]

const abi = {
  protocolFeesAccrued: 'function protocolFeesAccrued(address) view returns (uint256)',
  DepositPending: 'event DepositPending(uint256 indexed index, address indexed recipient, address token, uint256 amount, address depositor, uint256 gasEscrow)',
  DepositStatusChanged: 'event DepositStatusChanged(uint256 indexed index, uint8 status)',
}

// Deposits that are still waiting for the AML (Guard) check: the funds and the ETH gas escrow
// already sit on the pool contract, but they are not credited to the shielded pool until approved.
async function addPendingDeposits(api, sign) {
  const [pending, resolved] = await Promise.all([
    getLogs2({ api, target: POOL, eventAbi: abi.DepositPending, fromBlock: FROM_BLOCK }),
    getLogs2({ api, target: POOL, eventAbi: abi.DepositStatusChanged, fromBlock: FROM_BLOCK }),
  ])
  const resolvedIdx = new Set(resolved.map(i => i.index.toString()))
  pending
    .filter(i => !resolvedIdx.has(i.index.toString()))
    .forEach(i => {
      api.add(i.token, (BigInt(sign) * BigInt(i.amount)).toString())
      api.add(ADDRESSES.null, (BigInt(sign) * BigInt(i.gasEscrow)).toString())
    })
}

async function tvl(api) {
  // 1. everything the pool contract holds
  await api.sumTokens({ owner: POOL, tokens: TOKENS })

  // 2. minus protocol fees accrued in the pool and not yet swept to the treasury (sweepProtocolFees)
  const accrued = await api.multiCall({ abi: abi.protocolFeesAccrued, target: POOL, calls: TOKENS })
  TOKENS.forEach((token, i) => api.add(token, (-BigInt(accrued[i])).toString()))

  // 3. minus deposits still pending the Guard screening
  await addPendingDeposits(api, -1)
}

module.exports = {
  methodology: 'TVL is the value of user funds in the Nullmask shielded pool: the ETH and USDT held by the pool contract, minus protocol fees accrued but not yet swept to the treasury, minus deposits (and their gas escrow) still pending AML screening.',
  start: '2026-10-01',
  ethereum: { tvl },
}
