const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

//Fractal Addresses ETH
const FRACTAL_VAULT_CONTRACT_ETH = '0x3EAa4b3e8967c02cE1304C1EB35e8C5409838DFC';
const FRACTAL_YIELD_RESERVE_ETH = '0xbA83B569e99B6afc2f2BfE5124460Be6f36a4a56';

//Token Addresses ETH
const USDC_ETH = ADDRESSES.ethereum.USDC;

//Fractal Addresses ARB
const FRACTAL_VAULT_CONTRACT_ARB = '0x80e1a981285181686a3951B05dEd454734892a09'
const FRACTAL_YIELD_RESERVE_ARB = '0x7d7068fB0398906C693DBFc425584FD5b58c4B60'
const FRACTAL_CHRONOS_POOL = '0x468B6e0f89fa727A47d9512021050797B4875D6d'
const FRACTAL_CAMELOT_POOL = '0xf011B036934b58A619D2822d90ecd726126Efdf2'
const FRACTAL_CAMELOT_NITRO_POOL = '0x5d209809d3284309cC34B9D092f88fFc690de6c2'

//Token Addresses Arb
const USDC_ARB = ADDRESSES.arbitrum.USDC
const USDF_ARB = '0xae48b7C8e096896E32D53F10d0Bf89f82ec7b987'

//Fractal Addresses All Chains
const FRACTAL_FIREBLOCKS_OWNER = '0x931250786dFd106B1E63C7Fd8f0d854876a45200'

//Other Addresses
const CHRONOS_GAUGE = '0xDb1759d287d13b409fA80505b623e48cB9cc44Fc'

//Loans ETH
const ETH_LOANS = [
  '0x60f5A25DfdaBc3BfB3702bCB0142213CEaF1e89a'
]

const abis = {
  getTokenPrice: "uint256:getTokenPrice",
  exchangeRateStored: "uint256:exchangeRateStored",
  getVirtualPrice: "uint256:getVirtualPrice",
  principalToken: "address:principalToken",
  lockedLiquidityOf: "function lockedLiquidityOf(address account) view returns (uint256)",
  getDebt: "function getDebt() view returns (uint256 interestDebtAmount, uint256 grossDebtAmount, uint256 principalDebtAmount, uint256 interestOwed, uint256 applicableLateFee, uint256 netDebtAmount, uint256 daysSinceFunding, uint256 currentBillingCycle, uint256 minPaymentAmount, uint256 maxPaymentAmount)",
  userInfo: "function userInfo(address account) view returns (uint256 totalDepositAmount, uint256 rewardDebtToken1, uint256 rewardDebtToken2, uint256 pendingRewardsToken1, uint256 pendingRewardsToken2)"
}

// Define the function
async function getLoanDebt(loans, api) {
  const loanDebts = await api.multiCall({ abi: abis.getDebt, calls: loans })
  loanDebts.map((loanDebt) => api.add(USDC_ETH, loanDebt.principalDebtAmount, { skipChain: true }))
  return api.getBalances()
}

const getEthTvl = async (api) => {
  return sumTokens2({ owners: [FRACTAL_YIELD_RESERVE_ETH, FRACTAL_VAULT_CONTRACT_ETH], tokens: [USDC_ETH,], api })
};

const getEthLoans = async (api) => {
  return getLoanDebt(ETH_LOANS, api)
}

const getArbTvl = async (api) => {

  const [
    chronosLpBalance, usdcBalanceChronosPool, usdcBalanceCamelotPool,
  ] = await api.multiCall({
    abi: 'erc20:balanceOf', calls: [
      { target: CHRONOS_GAUGE, params: FRACTAL_FIREBLOCKS_OWNER },
      { target: USDC_ARB, params: FRACTAL_CHRONOS_POOL },
      { target: USDC_ARB, params: FRACTAL_CAMELOT_POOL },
    ]
  })

  const camelotUserInfo = await api.call({
    target: FRACTAL_CAMELOT_NITRO_POOL,
    abi: abis.userInfo,
    params: FRACTAL_FIREBLOCKS_OWNER,
  })

  const [
    chronosLpTokenSupply, camelotLpTokenSupply,
  ] = await api.multiCall({
    abi: 'erc20:totalSupply', calls: [
      FRACTAL_CHRONOS_POOL, FRACTAL_CAMELOT_POOL,
    ]
  })

  api.add(USDC_ARB, usdcBalanceChronosPool * chronosLpBalance / chronosLpTokenSupply)
  api.add(USDC_ARB, usdcBalanceCamelotPool * camelotUserInfo.totalDepositAmount / camelotLpTokenSupply)

  return sumTokens2({ api, tokens: [USDC_ARB], owners: [FRACTAL_YIELD_RESERVE_ARB, FRACTAL_VAULT_CONTRACT_ARB] })
};

module.exports = {
  ethereum: {
    tvl: getEthTvl,
    borrowed: getEthLoans
  },
  arbitrum: {
    tvl: getArbTvl,
  },
  avax: {
    tvl: () => ({}),
    borrowed: () => ({}),
  },
  polygon: {
    tvl: () => ({}),
  }
};
