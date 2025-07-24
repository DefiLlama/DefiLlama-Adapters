
const { cachedGraphQuery } = require("../helper/cache");

const config = {
  sei: {
    reader: "0xfeafb31AC7f09892B50c4d6DA06a1e48D487499E",
    api_url: "https://indexer-sei.mgvinfra.com/",
    chainId: 1329,
  }
}

const abi = {
  openMarkets: "function openMarkets() view returns ((address,address,uint256)[])",
  offerList: "function offerList((address,address,uint256),uint256,uint256) view returns (uint256,uint256[],(uint256,uint256,int256,uint256)[],(address,uint256,uint256,uint256)[])",
  getUnderlyingBalances: "function getUnderlyingBalances() public view returns (uint256 baseAmount, uint256 quoteAmount)",
}


const query = (chainId) => `
query DefiLlama {
	mangroveVaults (where:{chainId:${chainId}}) {
    items {
      address
      baseAddress
      quoteAddress
      kandelAddress
    }
  }
}
`

module.exports = {
  methodology: "TVL is the total value promised on oxium markets in addition to all non promised value that are in the ALM vaults.",
  start: "2025-04-25",
  doublecounted: true,  // tokens are kept in yei vault to get the yield
}

Object.keys(config).forEach(chain => {
  const configEntry = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {

      // vault tvl
      const { mangroveVaults: { items } } = await cachedGraphQuery(`oxium-vaults-${configEntry.chainId}`, configEntry.api_url, query(configEntry.chainId))
      const vaultMakers = new Set()
      const vaultBals = await api.multiCall({ abi: abi.getUnderlyingBalances, calls: items.map(vault => vault.address) })
      vaultBals.forEach((bals, i) => {
        const { baseAddress, quoteAddress, kandelAddress } = items[i]
        vaultMakers.add(kandelAddress.toLowerCase())

        api.add(baseAddress.toLowerCase(), bals.baseAmount)
        api.add(quoteAddress.toLowerCase(), bals.quoteAmount)
      })


      // book tvl
      const openMarkets = await api.call({ target: configEntry.reader, abi: abi.openMarkets, })
      for (const market of openMarkets) {
        let currentId = 0
        const token = market[0]
        do {

          const [newCurrId, _, offers, offerDetails] = await api.call({
            target: configEntry.reader,
            abi: abi.offerList,
            params: [market, currentId, 100],
          })
          offers.forEach((offer, index) => {
            const maker = offerDetails[index][0].toLowerCase()
            if (vaultMakers.has(maker)) return // skip vaults
            const gives = offer[3]
            api.add(token.toLowerCase(), gives)
          })

          currentId = +newCurrId
        } while (currentId !== 0)
      }
    }
  }
})





