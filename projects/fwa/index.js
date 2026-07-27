const { nullAddress } = require('../helper/tokenMapping')
const { getLogs } = require('../helper/cache/getLogs')

const FWA = '0xB276F62DB0ce8CA2Ca5bc522695bE604521eAc1c'
const DEPLOY_BLOCK = 25546793

// Every path that releases a listing's backing emits one of these, all carrying listingId.
const EXIT_EVENTS = [
  'event ListingWithdrawn(uint256 indexed listingId, address indexed depositor, uint256 value)',
  'event NFTKept(uint256 indexed listingId, address indexed purchaser, address indexed depositor, uint256 backing)',
  'event DepositorBidAccepted(uint256 indexed listingId, address indexed purchaser, address indexed depositor, uint256 payout, uint256 retained)',
  'event DepositorBidAcceptedAsTokens(uint256 indexed listingId, address indexed purchaser, address indexed depositor, uint256 ethPayout, uint256 retained, uint256 tokenOut)',
  'event UnsettledFinalized(uint256 indexed listingId, address indexed purchaser, address indexed depositor)',
  'event NFTRelisted(uint256 indexed listingId, uint256 indexed newListingId, uint256 toDepositor)',
]

// enum ListingStatus { None, Active, Allocated, Withdrawn, Settled, Staged }
const BACKED_STATUSES = new Set([1, 2, 5])

async function tvl(api) {
  const [nextListingId, ...exitedIdLists] = await Promise.all([
    api.call({ target: FWA, abi: 'uint256:nextListingId' }),
    ...EXIT_EVENTS.map((eventAbi) => getLogs({
      api, target: FWA, eventAbi, onlyArgs: true, fromBlock: DEPLOY_BLOCK,
      extraKey: eventAbi.split('(')[0].replace('event ', ''),
    })),
  ])
  const exitedIdSet = new Set(exitedIdLists.flat().map(log => Number(log.listingId)))

  const liveIds = []
  for (let id = 1; id < +nextListingId; id++)
    if (!exitedIdSet.has(id)) liveIds.push(id)

  const listings = await api.multiCall({
    target: FWA,
    abi: 'function listings(uint256) view returns (address collection, address depositor, address purchaser, uint256 tokenId, uint256 weight, uint256 value, uint256 feeShare, uint256 feeDebt, uint256 slot, uint64 allocatedAt, uint8 status)',
    calls: liveIds,
  })
  for (const listing of listings)
    if (BACKED_STATUSES.has(+listing.status))
      api.add(nullAddress, listing.value)
}

module.exports = {
  methodology: 'Sum of the ETH backing escrowed in the FWA core contract behind active, staged and allocated (purchased but unresolved) NFT listings. Depositor fee earnings, protocol fees and NFT value are not counted.',
  ethereum: { tvl },
}
