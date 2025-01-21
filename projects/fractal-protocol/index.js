const ADDRESSES = require('../helper/coreAssets.json')
const { userInfo } = require('../pendle/abi.json');
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

//Loans AVAX
const AVAX_LOANS = [
  '0x9297c3B0Eb3DB1Cc72E99cF641CE418a2c3791D9',
  '0x1952ae434FA8B5E9c9a1374951e5fd9ae7BD75C7',
  '0x9C7629E3bAD32631F3977eF7710415158208E057',
  '0x3f2ebE04329B96CBfF6E9911c64fC0c1Fc609d9C',
  '0x337dBC3d0C948F8Ef516F6678C3D63d11300Dc10',
  '0x595b16Aab6E43664Bf5F2DF0E34fEF1A8e7a2692'
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

const getArbTvl = async (_, _b, { arbitrum: block }, { api }) => {
  // const usdfPrice = await api.call({    target: FRACTAL_VAULT_CONTRACT_ARB,    abi: abis.getTokenPrice,  })

  const [
    chronosLpBalance, usdcBalanceChronosPool, usdfBalanceChronosPool, usdcBalanceCamelotPool, usdfBalanceCamelotPool,
  ] = await api.multiCall({
    abi: 'erc20:balanceOf', calls: [
      { target: CHRONOS_GAUGE, params: FRACTAL_FIREBLOCKS_OWNER },
      { target: USDC_ARB, params: FRACTAL_CHRONOS_POOL },
      { target: USDF_ARB, params: FRACTAL_CHRONOS_POOL },
      { target: USDC_ARB, params: FRACTAL_CAMELOT_POOL },
      { target: USDF_ARB, params: FRACTAL_CAMELOT_POOL },
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
  // api.add(USDF_ARB, usdfBalanceChronosPool * chronosLpBalance / chronosLpTokenSupply)
  // api.add(USDF_ARB, usdfBalanceCamelotPool * camelotUserInfo.totalDepositAmount / camelotLpTokenSupply)

  return sumTokens2({ api, tokens: [USDC_ARB], owners: [FRACTAL_YIELD_RESERVE_ARB, FRACTAL_VAULT_CONTRACT_ARB] })
};

const getAvaxTvl = async (_, _b, { avax: block }, { api }) => {
  const strategy = '0x9fea225c7953869e68b8228d2c90422d905e5117'
  const nUSDLP = '0xCA87BF3ec55372D9540437d7a86a7750B42C02f4'
  const nUSDSwap = '0xed2a7edd7413021d440b09d654f3b87712abab66'
  const synapseMiniChef = '0x3a01521f8e7f012eb37eaaf1cb9490a5d9e18249'
  const { amount } = await api.call({
    target: synapseMiniChef, params: [1, strategy],
    abi: userInfo,
  })
  const price = await api.call({
    target: nUSDSwap, abi: abis.getVirtualPrice,
  })
  const synapseBalance = amount * price / 1e36

  return { tether: synapseBalance }
}

const getAvaxLoans = async (_, _b, { avax: block }, { api }) => {
  return getLoanDebt(AVAX_LOANS, api)
}

const getPolygonTvl = async (_, _b, { polygon: block }, { api }) => {
  const strategy = '0x894cB5e24DDdD9ececb27831647ae869541Af28F'
  const nUSDLP = '0x7479e1bc2f2473f9e78c89b4210eb6d55d33b645'
  const nUSDSwap = '0x85fcd7dd0a1e1a9fcd5fd886ed522de8221c3ee5'
  const synapseMiniChef = '0x7875af1a6878bda1c129a4e2356a3fd040418be5'
  const { amount } = await api.call({
    target: synapseMiniChef, params: [1, strategy],
    abi: userInfo,
  })
  const price = await api.call({
    target: nUSDSwap, abi: abis.getVirtualPrice,
  })
  return { tether: amount * price / 1e36 }
}


module.exports = {
  ethereum: {
    tvl: getEthTvl,
    borrowed: getEthLoans
  },
  arbitrum: {
    tvl: getArbTvl
  },
  avax: {
    tvl: getAvaxTvl,
    borrowed: getAvaxLoans
  },
  polygon: {
    tvl: getPolygonTvl
  }
};
