const ADDRESSES = require('../helper/coreAssets.json')

const TOKEN_LOCK = '0x15B9B92F59C0ecFfBE4F200E35D13cEEF1bCbaE4'
const VESTING_VAULT = '0x6b885B0b4fc34CbD35ca55d083613087C0BC4295'
const AIRDROP_ESCROW = '0x86e2cA2C8B86A48F520433c562dB764b7B7EE74F'
const ETH_LOCK = '0x17CC7dBfb043F6954294Ba19564b8c143494203d'

// TokenLock deploy block, the earliest of the four contracts
const FROM_BLOCK = 84975063

const tokenEvents = [
  { target: TOKEN_LOCK, eventAbi: 'event LockCreated(uint256 indexed lockId, address indexed token, address indexed owner, uint256 amount, uint16 burnBps, uint64 unlockTime)' },
  { target: VESTING_VAULT, eventAbi: 'event VestingCreated(uint256 indexed vestingId, address indexed token, address indexed beneficiary, address grantor, uint256 amount, uint64 start, uint64 cliff, uint64 duration)' },
  { target: AIRDROP_ESCROW, eventAbi: 'event DropCreated(uint256 indexed dropId, address indexed token, address indexed creator, bytes32 merkleRoot, uint256 totalAmount, uint64 claimDeadline, uint8 mode, uint64 start, uint64 cliff, uint64 duration)' },
]

async function tvl(api) {
  const tokens = new Set()
  for (const { target, eventAbi } of tokenEvents) {
    const logs = await api.getLogs({ target, eventAbi, onlyArgs: true, fromBlock: FROM_BLOCK })
    logs.forEach(l => tokens.add(l.token))
  }
  await api.sumTokens({
    tokensAndOwners: [...tokens].flatMap(token => [[token, TOKEN_LOCK], [token, VESTING_VAULT], [token, AIRDROP_ESCROW]]),
  })
  await api.sumTokens({ owners: [ETH_LOCK], tokens: [ADDRESSES.null] })
}

module.exports = {
  methodology: 'TVL is the ERC-20 tokens held by the TokenLock, VestingVault and AirdropEscrow contracts, plus the ETH held by EthLock, on Robinhood Chain.',
  robinhood: { tvl },
}
