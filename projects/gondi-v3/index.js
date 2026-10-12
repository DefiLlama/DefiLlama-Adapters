const { sumTokensExport } = require('../helper/sumTokens')
const { getLogs2 } = require('../helper/cache/getLogs')

const TRANCHE = 'tuple(uint256 loanId, uint256 floor, uint256 principalAmount, address lender, uint256 accruedInterest, uint256 startTime, uint256 aprBps)[] tranche'
const LOAN_FIELDS = `address borrower, uint256 nftCollateralTokenId, address nftCollateralAddress, address principalAddress, uint256 principalAmount, uint256 startTime, uint256 duration, ${TRANCHE}, uint256 protocolFee`

const loanEvents = (loan, loanLiquidated) => ({
  LoanEmitted: `event LoanEmitted(uint256 loanId, uint256[] offerId, ${loan} loan, uint256 fee)`,
  LoanRefinanced: `event LoanRefinanced(uint256 renegotiationId, uint256 oldLoanId, uint256 newLoanId, ${loan} loan, uint256 fee)`,
  LoanRefinancedFromNewOffers: `event LoanRefinancedFromNewOffers(uint256 loanId, uint256 newLoanId, ${loan} loan, uint256[] offerIds, uint256 totalFee)`,
  LoanRepaid: 'event LoanRepaid(uint256 loanId, uint256 totalRepayment, uint256 fee)',
  LoanLiquidated: loanLiquidated,
  LoanSentToLiquidator: 'event LoanSentToLiquidator(uint256 loanId, address liquidator)',
  LoanForeclosed: 'event LoanForeclosed(uint256 loanId)',
})

// v3.2 appends `bool lenderRefinanceDisabled` to Loan and `bool foreclosed` to LoanLiquidated, so its event topics differ
const V3_1_EVENTS = loanEvents(`tuple(${LOAN_FIELDS})`, 'event LoanLiquidated(uint256 loanId)')
const V3_2_EVENTS = loanEvents(`tuple(${LOAN_FIELDS}, bool lenderRefinanceDisabled)`, 'event LoanLiquidated(uint256 loanId, bool foreclosed)')

const CLOSING_EVENTS = ['LoanRepaid', 'LoanLiquidated', 'LoanSentToLiquidator', 'LoanForeclosed']

const loanContracts = {
  ethereum: [
    { target: '0xf65b99ce6dc5f6c556172bcc0ff27d3665a7d9a8', fromBlock: 20663554, events: V3_1_EVENTS }, // MultiSourceLoan v3
    { target: '0xf41B389E0C1950dc0B16C9498eaE77131CC08A56', fromBlock: 23370217, events: V3_1_EVENTS }, // MultiSourceLoan v3.1
    { target: '0xE365fF3cad44d19cb7aBa81df8ffd6818A66Ac0a', fromBlock: 25875847, events: V3_2_EVENTS }, // MultiSourceLoan v3.2
  ],
  hyperliquid: [
    { target: '0x6ad675624ec8320e5806858cd5db101a0b927fd9', fromBlock: 15759157, events: V3_1_EVENTS }, // MultiSourceLoan v3.1
  ],
  robinhood: [
    { target: '0x0e79e08e9E35388382b7FebB26Bc73F80465e2fB', fromBlock: 40089270, events: V3_1_EVENTS }, // MultiSourceLoan v3.1
  ],
}

// MultiSourceLoan only stores keccak(loan) per loan id, so open loans are rebuilt from its events:
// a refinance closes the old id and opens a new one with the loan in the event.
async function addOpenLoans(api, { target, fromBlock, events }) {
  const logs = {}
  await Promise.all(Object.entries(events).map(async ([name, eventAbi]) => {
    logs[name] = await getLogs2({ api, target, fromBlock, eventAbi, extraKey: name })
  }))

  const loans = {}
  const closed = new Set()
  logs.LoanEmitted.forEach(({ loanId, loan }) => loans[loanId] = loan)
  logs.LoanRefinanced.forEach(({ oldLoanId, newLoanId, loan }) => {
    closed.add(String(oldLoanId))
    loans[newLoanId] = loan
  })
  logs.LoanRefinancedFromNewOffers.forEach(({ loanId, newLoanId, loan }) => {
    closed.add(String(loanId))
    loans[newLoanId] = loan
  })
  CLOSING_EVENTS.forEach(name => logs[name].forEach(({ loanId }) => closed.add(String(loanId))))

  Object.entries(loans)
    .filter(([loanId]) => !closed.has(loanId))
    .forEach(([, loan]) => loan.tranche.forEach(({ principalAmount }) => api.add(loan.principalAddress, principalAmount)))
}

async function borrowed(api) {
  for (const loanContract of loanContracts[api.chain]) await addOpenLoans(api, loanContract)
}

module.exports = {
  methodology: "Counts the floor value of the NFTs held as loan collateral by GONDI's escrow (MultiSourceLoan) and user vault contracts, priced with DefiLlama's NFT collection prices. Collections without a DefiLlama price are not counted. Borrowed is the outstanding principal of open loans, rebuilt from the MultiSourceLoan loan events: a loan stops counting once it is repaid, refinanced into a new loan, or liquidated.",
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        '0xf65b99ce6dc5f6c556172bcc0ff27d3665a7d9a8',
        '0x823de2c44369e94cac3da789ad4b6493e27e4bfe',
        '0xf41b389e0c1950dc0b16c9498eae77131cc08a56',
        '0xe365ff3cad44d19cb7aba81df8ffd6818a66ac0a',
      ],
      resolveNFTs: true,
    }),
    borrowed,
  },
  hyperliquid: {
    tvl: () => ({}),
    borrowed,
  },
  robinhood: {
    tvl: () => ({}),
    borrowed,
  },
}
