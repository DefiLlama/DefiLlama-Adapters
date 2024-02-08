const { queryContract, queryManyContracts, queryContracts } = require('../helper/chain/cosmos')

const chain = 'nolus'
const _6Zeros = 1000000
const _8Zeros = 100000000
const _18Zeros = 1000000000000000000

// Osmosis
const osmosisLeaserAddr = 'nolus1wn625s4jcmvk0szpl85rj5azkfc6suyvf75q6vrddscjdphtve8s5gg42f'
const osmosisOracleAddr = 'nolus1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgsv3wzl4'
const osmosisLppAddr = 'nolus1qg5ega6dykkxc307y25pecuufrjkxkaggkkxh7nad0vhyhtuhw3sqaa3c5'

// Neutron (Astroport)
const neutronLeaserAddr = 'nolus1et45v5gepxs44jxewfxah0hk4wqmw34m8pm4alf44ucxvj895kas5yrxd8'
const neutronOracleAddr = 'nolus1jew4l5nq7m3xhkqzy8j7cc99083m5j8d9w004ayyv8xl3yv4h0dql2dd4e'
const neutronLppAddr = 'nolus1qqcr7exupnymvg6m63eqwu8pd4n5x6r5t3pyyxdy7r97rcgajmhqy3gn94'

async function getLeaseCodeId(leaserAddress) {
  const leaserContract = await queryContract({
    contract: leaserAddress,
    chain: chain,
    data: { config: {} }
  })

  const leaseCodeId = leaserContract?.config?.lease_code_id
  if (!leaseCodeId) {
    return 0
  }

  return leaseCodeId
}

async function getLeaseContracts(leaseCodeId) {
  return await queryContracts({
    chain: chain,
    codeId: leaseCodeId,
  })
}

async function getLeases(leaseAddresses) {
  return await queryManyContracts({
    contracts: leaseAddresses,
    chain: chain,
    data: {}
  })
}

async function getPrices(oracleAddr) {
  const oracle = await queryContract({
    contract: oracleAddr,
    chain: chain,
    data: { prices: {} }
  })

  const prices = {}
  oracle.prices.forEach(p => {
    let price = 0
    switch (p.amount.ticker) {
      case "WBTC":
      case "CRO":
        price = (p.amount_quote.amount / (p.amount.amount / _8Zeros)) / _6Zeros
        break
      case "WETH":
      case "EVMOS":
      case "INJ":
      case "DYDX":
        price = (p.amount_quote.amount / (p.amount.amount / _18Zeros)) / _6Zeros
        break
      default:
        price = p.amount_quote.amount / p.amount.amount
        break
    }
    prices[p.amount.ticker] = price
  })

  return prices
}

async function getLppTvl(lppAddresses) {
  const lpps = await queryManyContracts({
    contracts: lppAddresses,
    chain: chain,
    data: { "lpp_balance": [] }
  })

  let totalLpp = 0
  lpps.forEach(v => {
    totalLpp += Number(v.balance.amount)
  })

  return totalLpp / _6Zeros
}

function sumAssests(leases) {
  let assets = {}
  leases.forEach(v => {
    if (v.opened) {
      const ticker = v.opened.amount.ticker
      const amount = BigInt(v.opened.amount.amount)

      if (ticker in assets) {
        assets[ticker] += amount
      } else {
        assets[ticker] = amount
      }
    }
  })
  return assets
}

function getAssetsTvl(assets, prices) {
  let totalTvl = 0
  for (const ticker in assets) {
    if (Object.hasOwnProperty.call(assets, ticker)) {
      let amount = 0
      switch (ticker) {
        case "WBTC":
        case "CRO":
          amount = Number(assets[ticker]) / _8Zeros
          break
        case "WETH":
        case "EVMOS":
        case "INJ":
        case "DYDX":
          amount = Number(assets[ticker]) / _18Zeros
          break
        default:
          amount = Number(assets[ticker]) / _6Zeros
          break
      }
      totalTvl += amount * prices[ticker]
    }
  }
  return totalTvl
}

async function tvl(leaserAddr, oracleAddr) {
  const leaseCodeId = await getLeaseCodeId(leaserAddr)
  const leaseContracts = await getLeaseContracts(leaseCodeId)
  const leases = await getLeases(leaseContracts)
  const assets = sumAssests(leases)
  const prices = await getPrices(oracleAddr)
  return getAssetsTvl(assets, prices)
}

module.exports = {
  methodology: "The combined total of lending pool assets and the current market value of active leases",
  nolus: {
    tvl: async () => {
      return {
        'axlusdc': await getLppTvl([osmosisLppAddr, neutronLppAddr])
      }
    }
  },
  neutron: {
    tvl: async () => {
      return {
        'axlusdc': await tvl(neutronLeaserAddr, neutronOracleAddr)
      }
    }
  },
  osmosis: {
    tvl: async () => {
      return {
        'axlusdc': await tvl(osmosisLeaserAddr, osmosisOracleAddr)
      }
    }
  }
}

// node test.js projects/nolus/index.js
