const { getLogs2 } = require('../helper/cache/getLogs')

const POSITION_LISTED_EVENT =
  'event PositionListed(uint256 indexed loanId, address indexed seller, string positionType, address paymentToken, uint256 askingPrice, uint256 minOfferAmount)'

const AUCTION_FINALIZED_EVENT =
  'event AuctionFinalized(uint256 indexed auctionId, uint256 indexed loanId, address indexed lender, uint256 finalRepayment)'

// same layout on both contracts (the NFT one holds collateralNFT/collateralTokenId in the collateral fields)
const GET_LOAN_ABI =
  'function getLoan(uint256) view returns ((address borrower, address collateral, uint256 collateralAmount, address loanToken, uint256 loanAmount, uint256 repaymentAmount, uint256 maturityTimestamp, address lender, uint8 status, uint256 pauseSnapshot))'
const LOAN_ACTIVE = 0
const GRACE_PERIOD = 86400

const configs = [
  {
    target: '0xFCDd6Ef75638D8D19ad634004C234Ad18751fEf2',
    fromBlock: 459939763,
    events: [
      {
        eventAbi:
          'event CollateralDeposited(address indexed user, address indexed token, uint256 amount)',
        extraKey: 'collateral-deposited',
        getTokens: ({ token }) => [token],
      },
      {
        eventAbi:
          'event AuctionCreated(uint256 indexed auctionId, address indexed borrower, address collateralToken, uint256 collateralAmount, address loanToken, uint256 loanAmount, uint256 maxRepayment, uint256 loanDuration, uint256 auctionEnd)',
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
    events: [
      {
        eventAbi:
          'event AuctionCreated(uint256 indexed auctionId, address indexed borrower, address collateralNFT, uint256 collateralTokenId, address loanToken, uint256 loanAmount, uint256 maxRepayment, uint256 loanDuration, uint256 auctionEnd)',
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

// Repayment is impossible once maturity + grace (extended by any pause) has passed, whether or not
// the loan was marked defaulted or its collateral claimed, so only ACTIVE loans inside that window count
async function addOutstandingLoans(api, { target, fromBlock }) {
  const loanIds = await getLogs2({ api, target, fromBlock, eventAbi: AUCTION_FINALIZED_EVENT, extraKey: 'auction-finalized', transform: ({ loanId }) => loanId })
  if (!loanIds.length) return

  const [loans, paused, pauseStart, totalPaused] = await Promise.all([
    api.multiCall({ target, abi: GET_LOAN_ABI, calls: loanIds }),
    api.call({ target, abi: 'bool:paused' }),
    api.call({ target, abi: 'uint256:pauseStartTimestamp' }),
    api.call({ target, abi: 'uint256:totalPausedDuration' }),
  ])
  const now = api.timestamp ?? Math.floor(Date.now() / 1000)
  const pausedTotal = Number(totalPaused) + (paused ? now - Number(pauseStart) : 0)

  loans.forEach(({ loanToken, loanAmount, maturityTimestamp, status, pauseSnapshot }) => {
    if (Number(status) !== LOAN_ACTIVE) return
    const repayDeadline = Number(maturityTimestamp) + GRACE_PERIOD + pausedTotal - Number(pauseSnapshot)
    if (now < repayDeadline) api.add(loanToken, loanAmount)
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
    'TVL is the value of ERC-20 collateral, active auction bids, pending refunds, and marketplace offer escrow held by the ERC-20 and NFT lending contracts. Borrowed is the principal of funded loans that are still active and repayable, i.e. not repaid, not defaulted and not past maturity plus the grace period.',
  start: '2026-05-06',
  arbitrum: { tvl, borrowed },
}
