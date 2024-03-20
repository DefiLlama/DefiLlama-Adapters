const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// https://docs.teller.org/teller-v2-protocol/l96ARgEDQcTgx4muwINt/resources/deployed-contracts
const config = {
  ethereum: { factory: '0x2551a099129ad9b0b1fec16f34d9cb73c237be8b', fromBlock: 16472616, tellerV2: '0x00182FdB0B880eE24D428e3Cc39383717677C37e', },
  polygon: { factory: '0x76888a882a4ff57455b5e74b791dd19df3ba51bb', fromBlock: 38446227, tellerV2: '0xD3D79A066F2cD471841C047D372F218252Dbf8Ed', },
  arbitrum: { factory: '0x71B04a8569914bCb99D5F95644CF6b089c826024', fromBlock: 108629315, tellerV2: '0x5cfD3aeD08a444Be32839bD911Ebecd688861164', },
  base: { factory: '0x71B04a8569914bCb99D5F95644CF6b089c826024', fromBlock: 2935376, tellerV2: '0x5cfD3aeD08a444Be32839bD911Ebecd688861164', },
  mantle: { factory: '0x6eB9b34913Bd96CA2695519eD0F8B8752d43FD2b', fromBlock: 3480394, tellerV2: '0xe6774DAAEdf6e95b222CD3dE09456ec0a46672C4', },
}

const blacklistedTokens = ['0x8f9bbbb0282699921372a134b63799a48c7d17fc', '0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401']

const data = {}

async function getData(api) {
  const key = `${api.chain}-${api.block}`
  if (!data[key]) data[key] = _getData()
  return data[key]

  async function _getData() {
    const chain = api.chain
    const { factory, fromBlock, tellerV2 } = config[chain]
    const collateralDepositedLogs = await getLogs({
      api,
      target: factory,
      topics: ['0x1a7f128dbc559fb97831b7681dee32957c2917e95d1c5070da20fb89e91f9d7a'],
      eventAbi: 'event CollateralDeposited (uint256 _bidId, uint8 _type, address _collateralAddress, uint256 _amount, uint256 _tokenId)',
      onlyArgs: true,
      extraKey: 'CollateralDeposited',
      fromBlock,
    })
    const escrowLogs = await getLogs({
      api,
      target: factory,
      topics: ['0xc201bfb915e3eed80ff17e013f3d88db1c51ac7fc12728fce91a2afc659128ef'],
      eventAbi: 'event CollateralEscrowDeployed (uint256 _bidId, address _collateralEscrow)',
      onlyArgs: true,
      extraKey: 'CollateralEscrowDeployed',
      fromBlock,
    })
    const repaidLogs = await getLogs({
      api,
      target: tellerV2,
      topic: 'LoanRepaid(uint256)',
      eventAbi: 'event LoanRepaid(uint256 indexed bidId)',
      extraKey: 'LoanRepaid',
      onlyArgs: true,
      fromBlock,
    })
    const liquidatedLogs = await getLogs({
      api,
      target: tellerV2,
      topic: 'LoanLiquidated(uint256,address)',
      eventAbi: 'event LoanLiquidated(uint256 indexed bidId, address indexed liquidator)',
      onlyArgs: true,
      extraKey: 'LoanLiquidated',
      fromBlock,
    })
    let closedBidSet = new Set()
    repaidLogs.forEach(i => closedBidSet.add(Number(i.bidId)))
    liquidatedLogs.forEach(i => closedBidSet.add(Number(i.bidId)))
    const escrowMap = {}
    escrowLogs.forEach(i => {
      const bidId = Number(i._bidId)
      if (closedBidSet.has(bidId)) return;
      if (escrowMap[bidId]) throw new Error('Escrow address already found for ' + bidId)
      escrowMap[bidId] = {
        owner: i._collateralEscrow,
        tokens: [],
      }
    })
    collateralDepositedLogs.forEach(i => {
      const bidId = Number(i._bidId)
      if (closedBidSet.has(bidId)) return;
      if (!escrowMap[bidId]) throw new Error('Escrow address missing for ' + bidId)
      escrowMap[bidId].tokens.push(i._collateralAddress)
    })
    return escrowMap
  }
}

async function tvl(api) {
  const data = await getData(api)
  return sumTokens2({ api, ownerTokens: Object.values(data).map(i => [i.tokens, i.owner]), blacklistedTokens, permitFailure: true, })
}

async function borrowed(api) {
  const data = await getData(api)
  const activeLoans = Object.keys(data)
  const { tellerV2 } = config[api.chain]
  const loanData = await api.multiCall({ abi: "function bids(uint256) view returns (address borrower, address receiver, address lender, uint256 marketplaceId, bytes32 _metadataURI, tuple(address lendingToken, uint256 principal, tuple(uint256 principal, uint256 interest) totalRepaid, uint32 timestamp, uint32 acceptedTimestamp, uint32 lastRepaidTimestamp, uint32 loanDuration) loanDetails, tuple(uint256 paymentCycleAmount, uint32 paymentCycle, uint16 APR) terms, uint8 state, uint8 paymentType)", calls: activeLoans, target: tellerV2 })
  loanData.forEach(i => {
    api.add(i.loanDetails.lendingToken, i.loanDetails.principal - i.loanDetails.totalRepaid.principal)
  })
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed, }
})