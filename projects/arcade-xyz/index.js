const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')
const { getCoreAssets } = require('../helper/tokenMapping')
const { sumArtBlocks, whitelistedNFTs } = require('../helper/nft')
const {
  LOAN_CORE_V2, LOAN_CORE_V3,
  BORROWER_NOTE_V2, BORROWER_NOTE_V3,
  VAULT_FACTORIES, LOAN_CORES,
  STAKING_REWARDS, SINGLE_SIDED_STAKING, ARCD, ARCD_WETH_LP,
  START_TS_V2_LAUNCH,
} = require('./constants')

// V2 and V3 LoanCore have different LoanData struct layouts.
const V2_GET_LOAN = 'function getLoan(uint256) view returns (tuple(uint8 state, uint24 numInstallmentsPaid, uint160 startDate, tuple(uint32 durationSecs, uint32 deadline, uint24 numInstallments, uint160 interestRate, uint256 principal, address collateralAddress, uint256 collateralId, address payableCurrency) terms, uint256 balance, uint256 balancePaid, uint256 lateFeesAccrued) loanData)'
const V3_GET_LOAN = 'function getLoan(uint256) view returns (tuple(uint8 state, uint160 startDate, tuple(uint256 proratedInterestRate, uint256 principal, address collateralAddress, uint96 durationSecs, uint256 collateralId, address payableCurrency, uint96 deadline, bytes32 affiliateCode) terms, tuple(uint16 lenderDefaultFee, uint16 lenderInterestFee, uint16 lenderPrincipalFee) feeSnapshot) loanData)'

const LOAN_STATE_ACTIVE = 1
const INTEREST_RATE_PRECISION = 10n ** 21n

function addBorrowedWithInterest(api, loan) {
  const { payableCurrency, principal } = loan.terms
  const rate = loan.terms.interestRate ?? loan.terms.proratedInterestRate
  api.add(payableCurrency, principal)
  if (rate)
    api.add(payableCurrency, (BigInt(principal.toString()) * BigInt(rate.toString()) / INTEREST_RATE_PRECISION).toString())
}

// Each VaultFactory is an ERC721; the vault NFT is transferred to LoanCore
// while a loan is active. So vault NFTs held by LoanCore = active vaults.
async function getActiveVaultAddresses(api) {
  const pairs = []
  for (const factory of VAULT_FACTORIES)
    for (const loanCore of LOAN_CORES)
      pairs.push({ factory, loanCore })

  const balances = await api.multiCall({
    abi: 'function balanceOf(address) view returns (uint256)',
    calls: pairs.map(p => ({ target: p.factory, params: [p.loanCore] })),
  })

  const indexCalls = []
  pairs.forEach((p, i) => {
    for (let j = 0; j < Number(balances[i]); j++)
      indexCalls.push({ factory: p.factory, owner: p.loanCore, idx: j })
  })
  if (!indexCalls.length) return []

  const tokenIds = await api.multiCall({
    abi: 'function tokenOfOwnerByIndex(address,uint256) view returns (uint256)',
    calls: indexCalls.map(c => ({ target: c.factory, params: [c.owner, c.idx] })),
  })
  return api.multiCall({
    abi: 'function instanceAt(uint256) view returns (address)',
    calls: indexCalls.map((c, i) => ({ target: c.factory, params: [tokenIds[i]] })),
  })
}

async function tvl(api) {
  const vaults = await getActiveVaultAddresses(api)
  const owners = [...vaults, LOAN_CORE_V2, LOAN_CORE_V3]
  const balances = {}
  await sumArtBlocks({ balances, api, owners })
  return sumTokens2({
    balances,
    api,
    owners,
    tokens: [nullAddress, ...getCoreAssets(api.chain), ...(whitelistedNFTs[api.chain] ?? [])],
    blacklistedTokens: VAULT_FACTORIES,
    permitFailure: true,
  })
}

// BorrowerNote is minted on origination, burned on repayment/claim, and its
// tokenIds equal the loanIds — so we can list active loans without indexers.
async function borrowed(api) {
  const sources = [
    { borrowerNote: BORROWER_NOTE_V2, loanCore: LOAN_CORE_V2, abi: V2_GET_LOAN },
    { borrowerNote: BORROWER_NOTE_V3, loanCore: LOAN_CORE_V3, abi: V3_GET_LOAN },
  ]
  for (const { borrowerNote, loanCore, abi } of sources) {
    const total = Number(await api.call({ target: borrowerNote, abi: 'uint256:totalSupply' }))
    if (!total) continue
    const loanIds = await api.multiCall({
      target: borrowerNote,
      abi: 'function tokenByIndex(uint256) view returns (uint256)',
      calls: Array.from({ length: total }, (_, i) => i),
    })
    const loans = await api.multiCall({ target: loanCore, abi, calls: loanIds })
    for (const loan of loans) {
      if (Number(loan.state) !== LOAN_STATE_ACTIVE) continue
      addBorrowedWithInterest(api, loan)
    }
  }
}

module.exports = {
  methodology: 'Sums on-chain the value of all NFTs and tokens held in active Arcade.xyz vaults (discovered by enumerating vault NFTs currently held by LoanCore) plus tokens escrowed directly in LoanCore V2/V3. Borrowed totals are read on-chain from active loans and are reported separately, not included in TVL.',
  start: START_TS_V2_LAUNCH,
  ethereum: {
    tvl,
    staking: staking([SINGLE_SIDED_STAKING, STAKING_REWARDS], [ARCD]),    
    pool2: pool2(STAKING_REWARDS, [ARCD_WETH_LP]),
    borrowed,
  },
  hallmarks: [
    ['2022-08-17', 'V2 Protocol Launch'],
    ['2023-09-06', 'V3 Protocol Launch'],
  ],
}
