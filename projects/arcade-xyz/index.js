const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')
const { getCoreAssets } = require('../helper/tokenMapping')
const { sumArtBlocks, whitelistedNFTs } = require('../helper/nft')
// V2
// https://etherscan.io/address/0x81b2f8fc75bab64a6b144aa6d2faa127b4fa7fd9
const LOAN_CORE_V2     = '0x81b2f8fc75bab64a6b144aa6d2faa127b4fa7fd9'
// https://etherscan.io/address/0x337104A4f06260Ff327d6734C555A0f5d8F863aa
const BORROWER_NOTE_V2 = '0x337104A4f06260Ff327d6734C555A0f5d8F863aa'
// https://etherscan.io/address/0x6e9b4c2f6bd57b7b924d29b5dcfca1273ecc94a2
const VAULT_FACTORY_V2_A         = '0x6e9b4c2f6bd57b7b924d29b5dcfca1273ecc94a2'
// https://etherscan.io/address/0x666faa632e5f7ba20a7fce36596a6736f87133be
const VAULT_FACTORY_V2_APE       = '0x666faa632e5f7ba20a7fce36596a6736f87133be'
// https://etherscan.io/address/0x7594916540e60fc8d6e9ba5c3c83632f7001cf53
const VAULT_FACTORY_V2_SUPERRARE = '0x7594916540e60fc8d6e9ba5c3c83632f7001cf53'

// V3
// https://etherscan.io/address/0x89bc08ba00f135d608bc335f6b33d7a9abcc98af
const LOAN_CORE_V3     = '0x89bc08ba00f135d608bc335f6b33d7a9abcc98af'
// https://etherscan.io/address/0xe5B12BEfaf3a91065DA7FDD461dEd2d8F8ECb7BE
const BORROWER_NOTE_V3 = '0xe5B12BEfaf3a91065DA7FDD461dEd2d8F8ECb7BE'
// https://etherscan.io/address/0x269363665dbb1582b143099a3cb467e98a476d55
const VAULT_FACTORY_V3 = '0x269363665dbb1582b143099a3cb467e98a476d55'

const VAULT_FACTORIES = [
  VAULT_FACTORY_V2_A,
  VAULT_FACTORY_V2_APE,
  VAULT_FACTORY_V2_SUPERRARE,
  VAULT_FACTORY_V3,
]
const LOAN_CORES = [LOAN_CORE_V2, LOAN_CORE_V3]

// Staking
const STAKING_REWARDS      = '0x80bDdd56b947c547Ab8964D80E98E42Ff77a5793'
const SINGLE_SIDED_STAKING = '0x72854FBb44d3dd87109D46a9298AEB0d018740f0'
const ARCD                 = '0xe020B01B6fbD83066aa2e8ee0CCD1eB8d9Cc70bF'
const ARCD_WETH_LP         = '0x06af8C358c0787640588734E4733A779961a2bca'

const START_TS_V2_LAUNCH = 1660694400 // 2022-08-17

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
