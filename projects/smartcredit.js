const ADDRESSES = require('./helper/coreAssets.json')
const { cachedGraphQuery } = require('./helper/cache')
const { getLogs } = require('./helper/cache/getLogs')

const endPoint = 'https://d2c7awq32ho327.cloudfront.net/graphql'
const SMART_CREDIT = '0x72e9D9038cE484EE986FEa183f8d8Df93f9aDA13'.toLowerCase()
const factory = '0x31ba589072278D82207212702De9A1C2B9D42c28'
const fromBlock = 14575305
const factoryAbi = {
  "FixedIncomeFundCreationComplete": "event FixedIncomeFundCreationComplete(address indexed fixedIncomeFund, bytes32 indexed salt)",
  "LoanContractCreated": "event LoanContractCreated(address indexed creditLine, address indexed borrower, bytes32 salt, bytes32 _type)",
  "createCreditLine": "function createCreditLine(bytes32 _type, bytes32 _salt) returns (address _creditLine)",
  "createNFTLoan": "function createNFTLoan(bytes32 _type, bytes32 _salt, tuple(address assetAddress, uint256 loanAmount, uint256 loanTerm, uint256 interestRate, address collateralAddress, uint256 collateralId) _loanRequest) returns (address _loanContract)",
  "createFixedIncomeFund": "function createFixedIncomeFund(bytes32 _type, bytes32 _salt, uint256[4] _ratios) returns (address _fixedIncomeFund)",
  "investFixedIncomeFundToCompound": "function investFixedIncomeFundToCompound(address[] _fixedIncomeFunds)"
}

const loanAbi = {
  "getLoanData": "function getLoanData(bytes32 _loanId) view returns (bytes32 loanId, uint256 currentCollateralAmount, uint256 loanEnded, uint256 outstandingAmount)",
}

const fixedIncomeAbi = {
  "getCurrencyAddress": "address:getCurrencyAddress",
  "getCompoundAddress": "address:getCompoundAddress",
  "fixedIncomeFundBalance": "uint256:fixedIncomeFundBalance"
}


const transformNull = i => i.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ? ADDRESSES.null : i

async function staking(api) {
  let { loanRequests } = await cachedGraphQuery('smart-credit', endPoint, `{
    loanRequests {
      id,
      contractAddress,
      loanStatus,
      liquidationStatus,
      underlying { ethAddress },
      collateral { ethAddress }
    }
  }`)
  loanRequests = loanRequests.filter(i => i)
  const ownerTokens = loanRequests.map(i => [[i.underlying.ethAddress, i.collateral.ethAddress].map(transformNull), i.contractAddress])
  return api.sumTokens({ ownerTokens, whitelistedTokens: [SMART_CREDIT] })
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl,
    staking,
    borrowed,
  }
}

async function tvl(api) {
  await fixedIncomeTvl(api)
  await loanTvl(api)
  return api.getBalances()
}


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
  const tokens = (await api.multiCall({ abi: fixedIncomeAbi.getCurrencyAddress, calls: pools })).map(transformNull)

  await api.sumTokens({ tokensAndOwners2: [tokens, pools], blacklistedTokens: [SMART_CREDIT] })
}

async function loanTvl(api) {
  let { loanRequests } = await cachedGraphQuery('smart-credit', endPoint, `{
    loanRequests {
      id,
      contractAddress,
      loanStatus,
      liquidationStatus,
      underlying { ethAddress },
      collateral { ethAddress }
    }
  }`)
  loanRequests = loanRequests.filter(i => i)
  const ownerTokens = loanRequests.map(i => [[i.underlying.ethAddress, i.collateral.ethAddress].map(transformNull), i.contractAddress])
  return api.sumTokens({ ownerTokens, blacklistedTokens: [SMART_CREDIT] })
}

async function borrowed(api) {
  let { loanRequests } = await cachedGraphQuery('smart-credit', endPoint, `{
    loanRequests {
      id,
      contractAddress,
      loanStatus,
      liquidationStatus,
      underlying { ethAddress },
      collateral { ethAddress }
    }
  }`)
  loanRequests = loanRequests.filter(i => i)
  const calls = loanRequests.map(i => ({ target: i.contractAddress, params: [i.id] }))
  const loanInfos = await api.multiCall({  abi: loanAbi.getLoanData, calls})
  loanInfos.forEach((i, idx) => {
    if (i.outstandingAmount === '0') return
    api.add(loanRequests[idx].underlying.ethAddress, i.outstandingAmount)
  })
  return api.getBalances()
}