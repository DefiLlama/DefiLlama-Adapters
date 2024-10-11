const sdk = require('@defillama/sdk')
const { transformBalances } = require('../helper/portedTokens')
const { queryContract, queryManyContracts, queryContracts } = require('../helper/chain/cosmos')

// Osmosis Noble USDC Protocol Contracts (OSMOSIS-OSMOSIS-USDC_NOBLE) pirin-1
const osmosisNobleOracleAddr = 'nolus1vjlaegqa7ssm2ygf2nnew6smsj8ref9cmurerc7pzwxqjre2wzpqyez4w6'
const osmosisNobleLppAddr = 'nolus1ueytzwqyadm6r0z8ajse7g6gzum4w3vv04qazctf8ugqrrej6n4sq027cf'
const osmosisNobleLeaserAddr = 'nolus1dca9sf0knq3qfg55mv2sn03rdw6gukkc4n764x5pvdgrgnpf9mzsfkcjp6'

// Osmosis axlUSDC Protocol Contracts (OSMOSIS-OSMOSIS-USDC_AXELAR) pirin-1
const osmosisAxlOracleAddr = 'nolus1vjlaegqa7ssm2ygf2nnew6smsj8ref9cmurerc7pzwxqjre2wzpqyez4w6'
const osmosisAxlLeaserAddr = 'nolus1wn625s4jcmvk0szpl85rj5azkfc6suyvf75q6vrddscjdphtve8s5gg42f'
const osmosisAxlLppAddr = 'nolus1qg5ega6dykkxc307y25pecuufrjkxkaggkkxh7nad0vhyhtuhw3sqaa3c5'

// Astroport Protocol Contracts (NEUTRON-ASTROPORT-USDC_AXELAR) pirin-1
const astroportOracleAddr = 'nolus1jew4l5nq7m3xhkqzy8j7cc99083m5j8d9w004ayyv8xl3yv4h0dql2dd4e'
const astroportLppAddr = 'nolus1qqcr7exupnymvg6m63eqwu8pd4n5x6r5t3pyyxdy7r97rcgajmhqy3gn94'
const astroportLeaserAddr = 'nolus1et45v5gepxs44jxewfxah0hk4wqmw34m8pm4alf44ucxvj895kas5yrxd8'

// Astroport Noble USDC Protocol Contracts (NEUTRON-ASTROPORT-USDC_NOBLE) pirin-1
const astroportNobleOracleAddr = 'nolus1vhzdx9lqexuqc0wqd48c5hc437yzw7jy7ggum9k25yy2hz7eaatq0mepvn'
const astroportNobleLeaserAddr = 'nolus1aftavx3jaa20srgwclakxh8xcc84nndn7yvkq98k3pz8ydhy9rvqkhj8dz'
const astroportNobleLppAddr = 'nolus17vsedux675vc44yu7et9m64ndxsy907v7sfgrk7tw3xnjtqemx3q6t3xw6'

const _6Zeros = 1000000

const nativeTokens = {
  'untrn': 'neutron:untrn',
  'uosmo': 'osmosis:uosmo'
}

async function getLeaseCodeId(leaserAddress) {
  const leaserContract = await queryContract({ contract: leaserAddress, chain: 'nolus', data: { 'config': {} } })
  const leaseCodeId = leaserContract?.config?.lease_code
  if (!leaseCodeId) {
    return 0
  }

  return leaseCodeId
}

async function getLeaseContracts(leaseCodeId) {
  return await queryContracts({ chain: 'nolus', codeId: leaseCodeId, })
}

async function getLeases(leaseAddresses) {
  return await queryManyContracts({ permitFailure: true, contracts: leaseAddresses, chain: 'nolus', data: {} })
}

async function getLppTvl(lppAddresses) {  
  const lpps = await queryManyContracts({ contracts: lppAddresses, chain: 'nolus', data: { 'lpp_balance': [] } })
  
  let totalLpp = 0
  lpps.forEach(v => {
    totalLpp += Number(v.balance.amount)
  })

  return totalLpp / _6Zeros
}

function sumAssests(balances, leases, currencies) {
  leases.forEach(v => {
    if (v.opened) {
      let ticker = v.opened.amount.ticker
      const amount = parseInt(v.opened.amount.amount, 10)
      const currencyData = find(currencies, (n) => n.ticker == ticker)
      if (currencyData) { 
        if (nativeTokens.hasOwnProperty(currencyData.dex_symbol)) {
          sdk.util.sumSingleBalance(balances, nativeTokens[currencyData.dex_symbol], amount)
        }
        sdk.util.sumSingleBalance(balances, currencyData.dex_symbol, amount)
      }
    }
  })
}

function find(collection, predicate) {
  for (let i = 0; i < collection.length; i++) {
    if (predicate(collection[i])) {
      return collection[i]
    }
  }

  return undefined
}

async function tvl(protocols) {
  let balances = {}
  for (let i = 0; i < protocols.length; i++) {
    const p = protocols[i]
    const oracleData = await queryContract({ contract: p.oracle, chain: 'nolus', data: { 'currencies': {} } })
    const leaseCodeId = await getLeaseCodeId(p.leaser)
    const leaseContracts = await getLeaseContracts(leaseCodeId)
    const leases = await getLeases(leaseContracts)
    sumAssests(balances, leases, oracleData)
  }
  return transformBalances('nolus', balances)
}

module.exports = {
  methodology: 'The combined total of lending pool assets and the current market value of active leases',
  nolus: {
    tvl: async () => {
      return {
        'axlusdc': await getLppTvl([osmosisAxlLppAddr, astroportLppAddr]),
        'usd-coin': await getLppTvl([osmosisNobleLppAddr, astroportNobleLppAddr])
      }
    }
  },
  neutron: {
    tvl: async () => {
      return await tvl([
        { leaser: astroportLeaserAddr, oracle: astroportOracleAddr },
        { leaser: astroportNobleLeaserAddr, oracle: astroportNobleOracleAddr },
      ])
    }
  },
  osmosis: {
    tvl: async () => {
      return await tvl([
        { leaser: osmosisNobleLeaserAddr, oracle: osmosisNobleOracleAddr },
        { leaser: osmosisAxlLeaserAddr, oracle: osmosisAxlOracleAddr },
      ])
    }
  }
}

// node test.js projects/nolus/index.js
