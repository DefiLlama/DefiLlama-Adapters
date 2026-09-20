const { getLogs2 } = require('../helper/cache/getLogs')

const POSITION_LISTED_EVENT =
  'event PositionListed(uint256 indexed loanId, address indexed seller, string positionType, address paymentToken, uint256 askingPrice, uint256 minOfferAmount)'

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

async function tvl(api) {
  for (const config of configs) await sumProtocolBalances(api, config)
}

module.exports = {
  methodology:
    'TVL is the value of ERC-20 collateral, active auction bids, pending refunds, and marketplace offer escrow held by the ERC-20 and NFT lending contracts.',
  start: '2026-05-06',
  arbitrum: { tvl },
}
