const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')

// MultiPool proxy, holds the credit-market accounting (per token) read by getCreditInfo below.
const MULTI_POOL = '0x974A1f9FA9C59874EA77221c9E52bB5a5Ed03429'
const DEPOSIT_VAULT = '0x579C9d3FC77793b14d9b3EC1F11a7fd5C7F9A34D'
const CREDIT_VAULT = '0xa75A28189a4E8250A98C347adf1e40fF36207268'

const EURC = '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c'
const TOKENS = [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, EURC]

const abi = {
  getCreditInfo: 'function getCreditInfo(address token, address user) view returns (tuple(address token, uint16 creditApr, uint128 totalDeposited, uint128 totalBorrowed, bool paused, tuple(uint128 principalBalance, uint256 pendingCreditInterest, bool isBorrower, tuple(uint32 creditId, uint256 pendingInterest, tuple(uint128 principalBalance, uint128 interestDebt, uint128 accruedInterest) creditLine)[] creditsInfo) userInfo, uint16 avgApr) creditInfo)',
}

async function borrowed(api) {
  const infos = await api.multiCall({ target: MULTI_POOL, abi: abi.getCreditInfo, calls: TOKENS.map(token => ({ params: [token, ADDRESSES.null] })) })
  infos.forEach((info, i) => api.add(TOKENS[i], info.totalBorrowed))
}

module.exports = {
  methodology: 'Tvl: value of USDC, USDT and EURC in the vaults, borrowed: USDC, USDT and EURC borrowed by the users',
  ethereum: {
    tvl: sumTokensExport({
      owners: [DEPOSIT_VAULT, CREDIT_VAULT],
      tokens: TOKENS,
    }),
    borrowed,
  },
}
