const sdk = require('@defillama/sdk')
const { cexExports } = require("../helper/cex")
const { mergeExports, getStakedEthTVL } = require("../helper/utils");
const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

const cexExportsObject = {}

const config = {
  ripple: {
    owners: [
      "rnuDDzvYWTPqXTDVvwE9oLGLgxzV7Rpnpe",
      "rafKN5p8iQsRP13LZXXoV8SCw2b9ugvjy1",
      "rGNCoeUNqBzQnEiK2X7EYDzSpJ7PtKQSBb",
      "rEXmdJZRfjXN3XGVdz99dGSZpQyJqUeirE",
      "r3rVXDv8HDUBcrckfda9YsnBkX2E62WLyK",
      "rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv",
      "rp8Ygdyi2u7DZuMbchpFKBpsgSeg4LXDFQ",
      "r3KfqsuMjp85ddhNN2xNAAbmrNKUgFbcpk",
      "rG2bzZ2Q9JcpPeCyqXTQts6jHSYsX21G6a",
      "rnTdkgZXF9AsEV8crG8KtngiD4nDC8Dkc2",
      "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
      "rHHrmqpzuDSkpcRK2PFm7P5Mo5zf927ina",
    ],
  },
};

const chains = [
  'bitcoin', 'litecoin', 'ripple',
  'ethereum', 'avax', 'solana', 'sui',  'xdc', 'near', 'cardano',
  // 'algorand',
]

chains.forEach(chain => {
  cexExportsObject[chain] = {
    tvl: async (...args) => {
      const data = await getAllData()
      const tvlFunc = cexExports({ [chain]: data[chain] })[chain].tvl
      return tvlFunc(...args)
    }
  }
})

let _allData

function getAllData() {
  if (!_allData)
    _allData = _getAllData()

  return _allData

  function _getAllData() {
    return getConfig('bitstamp', undefined, {
      fetcher: async () => {
        let page = 1
        let hasMorePages = true
        let lastItem
        const walletChainMapping = {}
        do {
          sdk.log('fetching page', page)
          const data = await get('https://www.bitstamp.net/api/v2/wallet_transparency/?perPage=1000&page=' + page)
          const allWallets = Object.values(data.wallets).flat()
          const currentLastItem = allWallets[allWallets.length - 1]

          allWallets.forEach(({ address, network }) => {
            if (!walletChainMapping[network])
              walletChainMapping[network] = {}
            walletChainMapping[network][address] = true
          })

          page++
          hasMorePages = !lastItem || currentLastItem.address !== lastItem.address
          lastItem = currentLastItem
        } while (hasMorePages)

        Object.entries(walletChainMapping).forEach(([chain, wallets]) => {
          walletChainMapping[chain] = { owners: Object.keys(wallets) }
        })

        walletChainMapping.avax = walletChainMapping['avalanche-c-chain']
        walletChainMapping.xdc = walletChainMapping['xdc-network']
        walletChainMapping.ripple = config.ripple
        return walletChainMapping
      }
    })
  }
}

const withdrawalAddresses = [
  '0x3262f13a39efaca789ae58390441c9ed76bc658a',
  '0xf666814c2ae92ca0e06667f80dac1eb8a97e48ae',
  '0x5c95a672e34b3252482ed9a215f2926d2887845d',
  '0x88a4df73aac310484c60c4c0ac4904cab938c20b',
]

module.exports = mergeExports([
  cexExportsObject,
  { ethereum: { tvl: getStakedEthTVL({ withdrawalAddresses: withdrawalAddresses, size: 200, sleepTime: 20_000, proxy: true }) } },
])

