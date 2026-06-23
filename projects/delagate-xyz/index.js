const { getLogs2, } = require('../helper/cache/getLogs')
const { getUniqueAddresses } = require('../helper/tokenMapping')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const tokens = await getLogs2({
    api,
    factory: '0x00000000000000447e69651d841bD8D104Bed493',
    fromBlock: 18184587,
    eventAbi: 'event DelegateERC721 (address indexed from, address indexed to, address indexed contract, uint256 tokenId, bytes32 rights, bool enable)',
    customCacheFunction: ({ cache, logs }) => {
      if (!cache.logs) cache.logs = []
      cache.logs.push(...logs.map(i => i.contract))
      cache.logs = getUniqueAddresses(cache.logs)
      return cache
    },
  })
  return sumTokens2({ owner: '0xc2e257476822377dfb549f001b4cb00103345e66', tokens, permitFailure: true, sumChunkSize: 10 })
}

module.exports = {
  ethereum: {
    tvl,
  },
}