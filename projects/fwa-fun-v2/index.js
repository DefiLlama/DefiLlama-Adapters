const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// https://www.fwa.fun/v2
const MAIN_POOL = '0x958C41181182e76F221331b2755b77D9e1426A98'
const LAUNCH_MANAGER = '0x716486a7bD6B4d7409fC4F8B52f0B23D2BcFac72'
const POOL_FACTORY = '0xf5a3a153164791ab579c3d9ba5dbecf7cdfd300c'

const DEPLOY_BLOCKS = {
  [MAIN_POOL]: 25944609,
  [LAUNCH_MANAGER]: 25944648,
  [POOL_FACTORY]: 26023011,
}

const NULL_ADDRESS = ADDRESSES.null

const events = {
  whitelist: 'event CollectionWhitelistSet(address indexed collection, bool allowed)',
  listed: 'event NFTListed(uint256 indexed listingId, uint256 indexed slot, address indexed depositor, address collection, uint256 tokenId, uint256 weight, uint256 price)',
}

async function tvl(api) {
  const block = await api.getBlock()
  const owners = []
  const collections = new Set()

  // Main pool: every listed NFT and its ETH backing. It only accepts whitelisted collections.
  if (block >= DEPLOY_BLOCKS[MAIN_POOL]) {
    owners.push(MAIN_POOL)
    const logs = await getLogs2({ api, target: MAIN_POOL, fromBlock: DEPLOY_BLOCKS[MAIN_POOL], eventAbi: events.whitelist, extraKey: 'whitelist' })
    logs.forEach(i => collections.add(i.collection.toLowerCase()))
  }

  // FWAIR launches hold supporter ETH and the artist's NFTs until each batch is listed in the main pool.
  // A launch's collection is only whitelisted once it is fully backed, so it is read from the launch itself.
  if (block >= DEPLOY_BLOCKS[LAUNCH_MANAGER]) {
    const count = await api.call({ abi: 'uint256:nextLaunchId', target: LAUNCH_MANAGER })
    const launches = (await api.multiCall({ abi: 'function launches(uint256) view returns (address)', target: LAUNCH_MANAGER, calls: Array.from({ length: +count }, (_, i) => i) })).filter(i => i !== NULL_ADDRESS)
    const launchCollections = await api.multiCall({ abi: 'address:collection', calls: launches })
    launches.forEach(i => owners.push(i))
    launchCollections.forEach(i => collections.add(i.toLowerCase()))
  }

  // Custom pools from the factory accept any collection, so theirs are read from their listing events
  if (block >= DEPLOY_BLOCKS[POOL_FACTORY]) {
    const pools = await api.fetchList({ lengthAbi: 'poolCount', itemAbi: 'allPools', target: POOL_FACTORY })
    for (const pool of pools) {
      owners.push(pool)
      const logs = await getLogs2({ api, target: pool, fromBlock: DEPLOY_BLOCKS[POOL_FACTORY], eventAbi: events.listed, extraKey: 'listed' })
      logs.forEach(i => collections.add(i.collection.toLowerCase()))
    }
  }

  return sumTokens2({ api, owners, tokens: [ADDRESSES.null, ...collections] })
}

module.exports = {
  start: '2026-09-10',
  methodology: 'Counts the ETH and NFTs held by the FWA V2 main pool, every FWAIR launch campaign and every custom pool created by the pool factory. ETH is depositors\' backing plus pending acquisition payments; NFTs are valued at their DefiLlama price, and collections without one count as zero. Collections are read from the main pool\'s whitelist events and the custom pools\' listing events. The Punk lister\'s idle strategy capital, the rewards and buyback contracts, the fee splitter and FWA tokens are excluded.',
  ethereum: { tvl },
}
