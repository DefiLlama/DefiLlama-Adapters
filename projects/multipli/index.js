const axios = require('axios')

const API = "https://api.multipli.fi/multipli/v1/external-aggregator/defillama/tvl/"

// API was reporting rwaUSDi total supply in balances
const rwaUSDis = {
  ethereum: '0xa39986f96b80d04e8d7aeaaf47175f47c23fd0f4',
  base: '0xd74FB32112b1eF5b4C428Fead8dA8d85A0019009',
  monad: '0x650b616b46ff94000eb115926ab8393b90788d76',
  arbitrum: '0xA39986F96B80d04e8d7AeAaF47175F47C23FD0f4'
}


const vaults = {
  ethereum: [
    '0x133229E0AdFf22c6F1AD287D199ea09d35E4427B', // USDC
    '0x3f453133ea14550B883805672B2871B0Ac295462', // USDT
    '0xeA1EF816ddfA86a8E9690423C88C1512c01d1799', // WBTC
  ],
  bsc: [
    '0x41DbD2BaC7F0dd7A3F0De5329eCb57c9afE14C5C', // wBTC
    '0xdA0dF997CE0253e979a1E892a0468DBf45A3Dcb8', // USDT
    '0x468e0dAbd55772775A9cD4c39fB0d4586B8aEdAe', // USDC
  ],
  avax: [
    '0xCF0Eb4ac018C06a16ED5c63484823C7805e7599D', // USDC
    '0x468BbabAEf852C134b584382C0fef83F2954Cd5c', // BTC.b
  ],
  monad: [
    '0xd74FB32112b1eF5b4C428Fead8dA8d85A0019009', // USDC
  ],
}

const tvl = async (api) => {
  const { data } = await axios.get(API)
  const balances = data.payload[api.chain] ?? {}

  const skipped = new Set()
  const blacklisted = rwaUSDis[api.chain]
  if (blacklisted) skipped.add(`${api.chain}:${blacklisted.toLowerCase()}`)

  const chainVaults = vaults[api.chain] ?? []
  if (chainVaults.length) {
    const assets = await api.multiCall({ abi: 'address:asset', calls: chainVaults })
    const totalAssets = await api.multiCall({ abi: 'uint256:totalAssets', calls: chainVaults })
    assets.forEach((asset, i) => {
      skipped.add(`${api.chain}:${asset.toLowerCase()}`) // prefer contract call over API balance
      api.add(asset, totalAssets[i])
    })
  }

  Object.entries(balances).forEach(([key, balance]) => {
    if (!skipped.has(key.toLowerCase())) api.addBalances({ [key]: balance })
  })
  return api.getBalances()
}

const chains = ['ethereum', 'bsc', 'avax', 'base', 'monad', 'arbitrum', 'pharos']
module.exports.timetravel = false
chains.forEach(chain => { module.exports[chain] = { tvl } })
