const axios = require('axios')
const API = "https://api.multipli.fi/multipli/v1/external-aggregator/defillama/tvl/"

// API was reporting rwaUSDi total supply in balances
const rwaUSDis = {
  ethereum: '0xa39986f96b80d04e8d7aeaaf47175f47c23fd0f4',
  base: '0xd74FB32112b1eF5b4C428Fead8dA8d85A0019009',
  monad: '0x650b616b46ff94000eb115926ab8393b90788d76',
  arbitrum: '0xA39986F96B80d04e8d7AeAaF47175F47C23FD0f4'
}

const tvl = async (api) => {
  const { data } = await axios.get(API)
  const balances = data.payload[api.chain] ?? {}
  const blacklisted = rwaUSDis[api.chain]?.toLowerCase()
  if (blacklisted) {
    const target = `${api.chain}:${blacklisted}`
    for (const key of Object.keys(balances)) {
      if (key.toLowerCase() === target) delete balances[key]
    }
  }
  return balances
}

const chains = ['ethereum', 'bsc', 'avax', 'base', 'monad', 'arbitrum']
module.exports.timetravel = false
chains.forEach(chain => { module.exports[chain] = { tvl } })
