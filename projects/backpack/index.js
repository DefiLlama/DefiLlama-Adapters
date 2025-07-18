const axios = require('axios')
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");
const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')
const { defaultTokens } = require('../helper/cex')

const API_URL = 'https://api.backpack.exchange/api/v1/wallets'

const getConfig = async () => {
  const { data } = await axios.get(API_URL)
  const config   = {}
  data.forEach(({ address, blockchain }) => {
    let chain = blockchain.toLowerCase()
    if (chain === 'avalanche') chain = 'avax'
    if (!config[chain]) config[chain] = { owners: [] }
    config[chain].owners.push(address)
  })
  return config
}

const exportObj = {  timetravel: false }
const chains = ['ethereum', 'solana', 'bitcoin', 'litecoin', 'arbitrum', 'optimism', 'polygon', 'base', 'bsc', 'avax', 'tron'];

chains.forEach((chain) => {
  exportObj[chain] = {
    tvl: async () => {
      const config = await getConfig()
      const entry = config[chain]
      if (!entry) return {}

      let { tokensAndOwners, owners, tokens, blacklistedTokens, fungibleAssets } = entry
      if (!tokensAndOwners && !tokens && chain !== 'solana') tokens = defaultTokens[chain] || [ADDRESSES.null]

      const options = { ...entry, owners, tokens, chain, blacklistedTokens }
      if (chain === 'solana' || chain === 'eclipse') options.solOwners = owners
      if (chain === 'ton') options.onlyWhitelistedTokens = true
      if (chain === 'aptos' && Array.isArray(fungibleAssets)) options.fungibleAssets = fungibleAssets

      return sumTokensExport(options)()
    }
  }
})

module.exports = exportObj