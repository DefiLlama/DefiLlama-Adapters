const ADDRESSES = require('helper/coreAssets.json')
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
  ADDRESSES.null, // ETH (null address)
  ADDRESSES.ethereum.USDC, // USDC
  ADDRESSES.ethereum.USDT, // USDT
  ADDRESSES.ethereum.STETH,  // stETH
  ADDRESSES.ethereum.DAI,  // DAI 
  "0x221657776846890989a759ba2973e427dff5c9bb",  // REP
  ADDRESSES.ethereum.LINK,  // LINK
  ADDRESSES.ethereum.BAT   // BAT
]
const underlyingTokens = [
  ADDRESSES.null, // ETH
  ADDRESSES.ethereum.USDC, // USDC
  ADDRESSES.ethereum.USDT, // USDT
  ADDRESSES.ethereum.DAI  // DAI 
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
    const token = i.currency === ADDRESSES.GAS_TOKEN_2 ? [ADDRESSES.null]: i.currency;
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