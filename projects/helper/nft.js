const sdk = require('@defillama/sdk')
const whitelistedNFTs = require('./whitelistedNfts.js')

const ART_BLOCK_RANGES = {
  "chromie-squiggle": { start: 0, end: 9733 },
  "fidenza": { start: 78000000, end: 78000998 },
  "ringer": { start: 13000000, end: 13000999 },
}

const ART_BLOCKS = '0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270'.toLowerCase()
const ART_BLOCKS_OLD = '0x059edd72cd353df5106d2b9cc5ab83a52287ac3a'.toLowerCase()

async function sumArtBlocks({ balances = {}, api, owner, owners = [] }) {
  if (owner) owners = [owner]
  if (!owners.length) return balances
  let nftIds = (await api.multiCall({ abi: 'function tokensOfOwner(address) view returns (uint256[])', calls: owners, target: ART_BLOCKS, })).flat()
  const nftIds_old = (await api.multiCall({ abi: 'function tokensOfOwner(address) view returns (uint256[])', calls: owners, target: ART_BLOCKS_OLD, })).flat()
  const idSet = new Set([nftIds, nftIds_old].flat())
  nftIds = [...idSet]
  Object.entries(ART_BLOCK_RANGES).forEach(([label, { start, end }]) => {
    nftIds.forEach((id) => {
      id = +id
      if (id >= start && id <= end) sdk.util.sumSingleBalance(balances, label, 1, 'nft')
    })
  })
  return balances
}

function isArtBlocks(collectionAddress) {
  collectionAddress = collectionAddress.toLowerCase()
  return [ART_BLOCKS, ART_BLOCKS_OLD].includes(collectionAddress)
}

module.exports = {
  sumArtBlocks,
  isArtBlocks,
  whitelistedNFTs,
}