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

async function borrowed(api) {
  const { totalBorrowed } = await api.call({ target: MULTI_POOL, abi: abi.getCreditInfo, params: [ADDRESSES.ethereum.USDC, ADDRESSES.null] })
  api.add(ADDRESSES.ethereum.USDC, totalBorrowed)
}

module.exports = {
  methodology: 'Tvl: alue of USDC in the vault, borrowed: USDC borrowed by the users',
  ethereum: {
    tvl: sumTokensExport({
      owners: [DEPOSIT_VAULT, CREDIT_VAULT],
      tokens: [ADDRESSES.ethereum.USDC],
    }),
    borrowed,
  },
}

