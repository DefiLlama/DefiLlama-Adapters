
const { cachedGraphQuery } = require("../helper/cache");

const config = {
  somnia: {
    reader: "0xd64f451698bb38cd594bf54b52fd3608c1f9863a",
    api_url: "https://elixfi-indexer.up.railway.app/",
    chainId: 5031,
  }
}

const abi = {
  openMarkets: "function openMarkets() view returns ((address,address,uint256)[])",
  offerList: "function offerList((address,address,uint256),uint256,uint256) view returns (uint256,uint256[],(uint256,uint256,int256,uint256)[],(address,uint256,uint256,uint256)[])",
  getUnderlyingBalances: "function getUnderlyingBalances() public view returns (uint256 baseAmount, uint256 quoteAmount)",
  totalBalances: "function totalBalances() public view returns (uint256 baseAmount, uint256 quoteAmount)",
}


const query = (chainId) => `
query DefiLlama {
  vaultsV2s (where:{chainId:"${chainId}"}) {
    items{
      address
      baseAddress
      quoteAddress
      kandelAddress
    }
  }
}
`

module.exports = {
  methodology: "TVL is the total value promised on Elix.fi markets in addition to all non promised value that are in the ALM vaults.",
  start: "2025-10-20",
  doublecounted: true,
}

async function getBalances(api, items, vaultMakers, version) {
  const balances = await api.multiCall({ abi: version === 1 ? abi.getUnderlyingBalances : abi.totalBalances, calls: items.map(vault => vault.address) })
  balances.forEach((bals, i) => {
    const { baseAddress, quoteAddress, kandelAddress } = items[i]
    vaultMakers.add(kandelAddress.toLowerCase())

    api.add(baseAddress.toLowerCase(), bals.baseAmount)
    api.add(quoteAddress.toLowerCase(), bals.quoteAmount)
  })
}

Object.keys(config).forEach(chain => {
  const configEntry = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      // vault tvl
      const { vaultsV2s: { items: itemsV2 } } = await cachedGraphQuery(`elix-vaults-v2-${configEntry.chainId}`, configEntry.api_url, query(configEntry.chainId))
      const vaultMakers = new Set()
      
      await getBalances(api, itemsV2, vaultMakers, 2)

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
