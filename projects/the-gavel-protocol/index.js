const { getLogs2 } = require('../helper/cache/getLogs')

const POSITION_LISTED_EVENT =
  'event PositionListed(uint256 indexed loanId, address indexed seller, string positionType, address paymentToken, uint256 askingPrice, uint256 minOfferAmount)'

const AUCTION_FINALIZED_EVENT =
  'event AuctionFinalized(uint256 indexed auctionId, uint256 indexed loanId, address indexed lender, uint256 finalRepayment)'
const LOAN_REPAID_EVENT =
  'event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 repaymentAmount)'

const ERC20_AUCTION_CREATED_EVENT =
  'event AuctionCreated(uint256 indexed auctionId, address indexed borrower, address collateralToken, uint256 collateralAmount, address loanToken, uint256 loanAmount, uint256 maxRepayment, uint256 loanDuration, uint256 auctionEnd)'
const NFT_AUCTION_CREATED_EVENT =
  'event AuctionCreated(uint256 indexed auctionId, address indexed borrower, address collateralNFT, uint256 collateralTokenId, address loanToken, uint256 loanAmount, uint256 maxRepayment, uint256 loanDuration, uint256 auctionEnd)'

const configs = [
  {
    target: '0xFCDd6Ef75638D8D19ad634004C234Ad18751fEf2',
    fromBlock: 459939763,
    auctionCreatedEvent: ERC20_AUCTION_CREATED_EVENT,
    loanDefaultedEvent:
      'event LoanDefaulted(uint256 indexed loanId, address indexed lender, uint256 collateralAmount)',
    events: [
      {
        eventAbi:
          'event CollateralDeposited(address indexed user, address indexed token, uint256 amount)',
        extraKey: 'collateral-deposited',
        getTokens: ({ token }) => [token],
      },
      {
        eventAbi: ERC20_AUCTION_CREATED_EVENT,
        extraKey: 'auction-created',
        getTokens: ({ collateralToken, loanToken }) => [collateralToken, loanToken],
      },
      {
        eventAbi: POSITION_LISTED_EVENT,
        extraKey: 'position-listed',
        getTokens: ({ paymentToken }) => [paymentToken],
      },
    ],
  },
  {
    target: '0x506e414c7D39639B2E9E318C46eD378AD51147eb',
    fromBlock: 459939837,
    auctionCreatedEvent: NFT_AUCTION_CREATED_EVENT,
    loanDefaultedEvent:
      'event LoanDefaulted(uint256 indexed loanId, address indexed lender, address collateralNFT, uint256 collateralTokenId)',
    events: [
      {
        eventAbi: NFT_AUCTION_CREATED_EVENT,
        extraKey: 'auction-created',
        getTokens: ({ loanToken }) => [loanToken],
      },
      {
        eventAbi: POSITION_LISTED_EVENT,
        extraKey: 'position-listed',
        getTokens: ({ paymentToken }) => [paymentToken],
      },
    ],
  },
]

async function sumProtocolBalances(api, { target, fromBlock, events }) {
  const tokenLists = await Promise.all(
    events.map(({ eventAbi, extraKey, getTokens }) =>
      getLogs2({
        api,
        target,
        fromBlock,
        eventAbi,
        extraKey,
        transform: getTokens,
      })
    )
  )

  const tokens = [...new Set(tokenLists.flat(2))]
  if (tokens.length) await api.sumTokens({ owner: target, tokens })
}

// A loan opens on AuctionFinalized and closes on LoanRepaid or LoanDefaulted (collateral claimed)
async function addOutstandingLoans(api, { target, fromBlock, auctionCreatedEvent, loanDefaultedEvent }) {
  const getLogs = (eventAbi, extraKey) => getLogs2({ api, target, fromBlock, eventAbi, extraKey })
  const [auctions, finalized, repaid, defaulted] = await Promise.all([
    getLogs(auctionCreatedEvent, 'auction-created'),
    getLogs(AUCTION_FINALIZED_EVENT, 'auction-finalized'),
    getLogs(LOAN_REPAID_EVENT, 'loan-repaid'),
    getLogs(loanDefaultedEvent, 'loan-defaulted'),
  ])

  const auctionById = {}
  auctions.forEach((auction) => (auctionById[auction.auctionId] = auction))
  const closedLoans = new Set([...repaid, ...defaulted].map(({ loanId }) => String(loanId)))

  finalized.forEach(({ auctionId, loanId }) => {
    if (closedLoans.has(String(loanId))) return
    const { loanToken, loanAmount } = auctionById[auctionId]
    api.add(loanToken, loanAmount)
  })
}

async function tvl(api) {
  for (const config of configs) await sumProtocolBalances(api, config)
}

async function borrowed(api) {
  for (const config of configs) await addOutstandingLoans(api, config)
}

module.exports = {
  methodology:
    'TVL is the value of ERC-20 collateral, active auction bids, pending refunds, and marketplace offer escrow held by the ERC-20 and NFT lending contracts. Borrowed is the principal of loans that have been funded and not yet repaid or defaulted, taken from auction finalization, repayment and default events.',
  start: '2026-05-06',
  arbitrum: { tvl, borrowed },
}
