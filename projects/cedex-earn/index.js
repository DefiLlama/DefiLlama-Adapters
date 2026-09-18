const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')

// MultiPool proxy, holds the credit-market accounting (token) read by getCreditInfo below.
const MULTI_POOL = '0x89c5c95118a9E1e563B6ADfEC56Fa82b81DfADDb'
// Deposit pool currently created on ethereum uses USDC.
const DEPOSIT_VAULT = '0x579C9d3FC77793b14d9b3EC1F11a7fd5C7F9A34D'
const CREDIT_VAULT = '0xa75A28189a4E8250A98C347adf1e40fF36207268'

const abi = {
  getCreditInfo: 'function getCreditInfo(address token, address user) view returns (tuple(address token, uint16 creditApr, uint128 totalDeposited, uint128 totalBorrowed, bool paused, tuple(uint128 principalBalance, uint256 pendingCreditInterest, bool isBorrower, tuple(uint32 creditId, uint256 pendingInterest, tuple(uint128 principalBalance, uint128 interestDebt, uint128 accruedInterest) creditLine)[] creditsInfo) userInfo, uint16 avgApr) creditInfo)',
}

async function getTotalBorrowed(api) {
  const { totalBorrowed } = await api.call({ target: MULTI_POOL, abi: abi.getCreditInfo, params: [ADDRESSES.ethereum.USDC, ADDRESSES.null] })
  return totalBorrowed
}

async function tvl(api) {
  await sumTokensExport({
    owners: [DEPOSIT_VAULT, CREDIT_VAULT],
    tokens: [ADDRESSES.ethereum.USDC],
  })(api)
  api.add(ADDRESSES.ethereum.USDC, await getTotalBorrowed(api))
}

async function borrowed(api) {
  api.add(ADDRESSES.ethereum.USDC, await getTotalBorrowed(api))
}

module.exports = {
  methodology: 'TVL is the USDC still owed to depositors: the balance held by CEDEX Earn MultiPool\'s two vault addresses (CREDIT_VAULT, which receives deposits and funds whitelisted borrowers, and DEPOSIT_VAULT, which holds funds secured ahead of a withdrawal payout) plus the USDC currently drawn out to whitelisted borrowers, read from the credit market\'s totalBorrowed via getCreditInfo. Borrowed is also reported separately for visibility.',
  ethereum: {
    tvl,
    borrowed,
  },
}
