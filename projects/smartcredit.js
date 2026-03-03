const { getLogs } = require('./helper/cache/getLogs')

const SMART_CREDIT = '0x72e9D9038cE484EE986FEa183f8d8Df93f9aDA13'.toLowerCase()
const factory = '0x31ba589072278D82207212702De9A1C2B9D42c28'
const fromBlock = 14575305
const factoryAbi = {
  "FixedIncomeFundCreationComplete": "event FixedIncomeFundCreationComplete(address indexed fixedIncomeFund, bytes32 indexed salt)",
  "LoanContractCreated": "event LoanContractCreated(address indexed creditLine, address indexed borrower, bytes32 salt, bytes32 _type)",
}

const fixedIncomeAbi = {
  "getCompoundAddress": "address:getCompoundAddress",
  "fixedIncomeFundBalance": "uint256:fixedIncomeFundBalance",
  "getFixedIncomeFundDetails": "function getFixedIncomeFundDetails() external view returns(address owner, address currency, uint256 balance, uint256 invested, uint256[4] memory buckets)"
}

// Supported tokens (hardcoded for efficiency - verified from protocol docs)
const collateralTokens = [
  "0x0000000000000000000000000000000000000000", // ETH (null address)
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",  // stETH
  "0x6b175474e89094c44da98b954eedeac495271d0f",  // DAI 
  "0x221657776846890989a759ba2973e427dff5c9bb",  // REP
  "0x514910771af9ca656af840dff83e8264ecf986ca",  // LINK
  "0x0d8775f648430679a709e98d2b0cb6250d2887ef"   // BAT
]
const underlyingTokens = [
  "0x0000000000000000000000000000000000000000", // ETH
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
  "0x6b175474e89094c44da98b954eedeac495271d0f"  // DAI 
]


/**
 * TVL: Sum of assets in Fixed Income Funds + collateral in Loan contracts
 * - Fixed Income: underlying tokens deposited by lenders
 * - Loans: collateral tokens deposited by borrowers
 */
async function tvl(api) {
  await fixedIncomeTvl(api)
  await collateralTvl(api)
  return api.getBalances()
}

/**
 * Fixed Income TVL: Underlying tokens deposited in Fixed Income Funds by lenders
 * Excludes SMARTCREDIT protocol token to avoid double-counting with staking
 * @param {Object} api - DefiLlama SDK api instance
 */
async function fixedIncomeTvl(api) {
  const logs = await getLogs({
    api,
    target: factory,
    eventAbi: factoryAbi.FixedIncomeFundCreationComplete,
    onlyArgs: true,
    fromBlock,
    extraKey: 'fixedIncomeFund',
  })
  const pools = logs.map(l => l.fixedIncomeFund)
  await api.sumTokens({ tokens: underlyingTokens, owners: pools, blacklistedTokens: [SMART_CREDIT] })
}

/**
 * Collateral TVL: Collateral tokens in active loan contracts (creditlines)
 * Borrowers deposit collateral which stays locked until loans are repaid/liquidated
 * @param {Object} api - DefiLlama SDK api instance
 */
async function collateralTvl(api) {
  const logs = await getLogs({
    api,
    target: factory,
    eventAbi: factoryAbi.LoanContractCreated,
    onlyArgs: true,
    fromBlock,
    extraKey: 'creditLine',
  })
  const pools = logs.map(l => l.creditLine.toLowerCase())
  await api.sumTokens({ tokens: collateralTokens, owners: pools })
}



/**
 * Borrowed: Total outstanding loan principal across all Fixed Income Funds
 * All borrows originate from Fixed Income Funds → invested amount = total borrowed
 * Excludes SMARTCREDIT token loans (protocol-internal operations)
 * @param {Object} api - DefiLlama SDK api instance
 * @returns {Object} Balances object with borrowed amounts by token
 */
async function borrowed(api) {
  const logs = await getLogs({
    api,
    target: factory,
    eventAbi: factoryAbi.FixedIncomeFundCreationComplete,
    onlyArgs: true,
    fromBlock,
    extraKey: 'fixedIncomeFund',
  })

  const pools = logs.map(l => l.fixedIncomeFund)
  const poolInfos = await api.multiCall({ abi: fixedIncomeAbi.getFixedIncomeFundDetails, calls: pools })
  
  poolInfos.forEach((i, idx) => {
    if (i.currency.toLowerCase() === SMART_CREDIT) return
    const token = i.currency === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? '0x0000000000000000000000000000000000000000' : i.currency;
    api.add(token, i.invested)
  })
  return api.getBalances()
}


/**
 * Staking: SMARTCREDIT protocol tokens staked in Fixed Income Funds
 * @param {Object} api - DefiLlama SDK api instance
 */
async function staking(api) {
  const logs = await getLogs({
    api,
    target: factory,
    eventAbi: factoryAbi.FixedIncomeFundCreationComplete,
    onlyArgs: true,
    fromBlock,
    extraKey: 'fixedIncomeFund',
  })
  const pools = logs.map(l => l.fixedIncomeFund)
  return api.sumTokens({ owners: pools, tokens: [SMART_CREDIT] })
}


module.exports = {
  timetravel: false,
  ethereum: {
    tvl,
    staking,
    borrowed,
  }
}