const sdk = require('@defillama/sdk')
const whitelistedNFTs = require('./whitelistedNfts.js')
const { getUniqueAddresses } = require('./utils')

const { AB_COLLECTIONS, AB_OLD_COLLECTIONS } = whitelistedNFTs
const ART_BLOCKS = '0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270'.toLowerCase()
const ART_BLOCKS_OLD = '0x059edd72cd353df5106d2b9cc5ab83a52287ac3a'.toLowerCase()

async function sumArtBlocks({ balances = {}, api, owner, owners = [] }) {
  if (owner) owners = [owner]
  if (!owners.length) return balances
  owners = getUniqueAddresses(owners)
  let nftIds = (await api.multiCall({ abi: 'function tokensOfOwner(address) view returns (uint256[])', calls: owners, target: ART_BLOCKS, })).flat()
  const nftIds_old = (await api.multiCall({ abi: 'function tokensOfOwner(address) view returns (uint256[])', calls: owners, target: ART_BLOCKS_OLD, })).flat()

  addIds(nftIds, AB_COLLECTIONS)
  addIds(nftIds_old, AB_OLD_COLLECTIONS)

  return balances

  function addIds(ids, collections) {
    if (!ids.length) return;
    collections.map(i => {
      const [_, start, end] = i.split(':')
      return { label: i, start: +start, end: +end }
    }).forEach(({ label, start, end}) => {
      ids.forEach((id) => {
        id = +id
        if (id >= start && id <= end) sdk.util.sumSingleBalance(balances, label, 1, api.chain)
      })
    })

  }
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