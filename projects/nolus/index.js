const { queryContract, queryManyContracts, queryContracts } = require('../helper/chain/cosmos')

const leaserAddress = 'nolus1wn625s4jcmvk0szpl85rj5azkfc6suyvf75q6vrddscjdphtve8s5gg42f'
const oracleAddress = 'nolus1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgsv3wzl4'
const lppAddress = 'nolus1qg5ega6dykkxc307y25pecuufrjkxkaggkkxh7nad0vhyhtuhw3sqaa3c5'
const chain = 'nolus'

async function getLeaseCodeId() {
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

async function getLeases(leaseContracts) {
  return await queryManyContracts({
    contracts: leaseContracts,
    chain: chain,
    data: {}
  })
}

async function getPrices() {
  const oracle = await queryContract({
    contract: oracleAddress,
    chain: chain,
    data: { prices: {} }
  })

  const prices = {}
  oracle.prices.forEach(p => {
    let price = 0
    switch (p.amount.ticker) {
      case "WBTC":
        price = (p.amount_quote.amount / (p.amount.amount / 100000000)) / 1000000
        break
      case "WETH":
      case "EVMOS":
        price = (p.amount_quote.amount / (p.amount.amount / 1000000000000000000)) / 1000000
        break
      default:
        price = p.amount_quote.amount / p.amount.amount
        break
    }
    prices[p.amount.ticker] = price
  })

  return prices
}

async function getLppTvl() {
  const lpp = await queryContract({
    contract: lppAddress,
    chain: chain,
    data: { "lpp_balance": [] }
  })

  return Number(lpp.balance.amount) / 1000000
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
          amount = Number(assets[ticker]) / 100000000
          break
        case "WETH":
        case "EVMOS":
          amount = Number(assets[ticker]) / 1000000000000000000
          break
        default:
          amount = Number(assets[ticker]) / 1000000
          break
      }
      totalTvl += amount * prices[ticker]
    }
  }
  return totalTvl
}

async function tvl() {
  const leaseCodeId = await getLeaseCodeId()
  const leaseContracts = await getLeaseContracts(leaseCodeId)
  const leases = await getLeases(leaseContracts)
  const assets = sumAssests(leases)
  
  const prices = await getPrices()
  const assetsTvl = getAssetsTvl(assets, prices)
  const lppTvl = await getLppTvl()
  return {
    'axlusdc': assetsTvl + lppTvl
  }
}

module.exports = {
  methodology: "The combined total of lending pool assets and the current market value of active leases",
  nolus: {
    tvl
  }
}

// node test.js projects/nolus/index.js
