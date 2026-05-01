const { getEnv } = require('../env')
const http = require('../http')

const endpoint = () => getEnv('ALEO_RPC')

async function aQuery(path) {
  return http.get(`${endpoint()}${path}`)
}

const sdk = require('@defillama/sdk')
const { transformBalances } = require('../portedTokens')

/**
 * Fetch a value from a mapping within an Aleo program.
 * e.g., getProgramMappingValue('credits.aleo', 'account', 'aleo1...')
 */
async function getProgramMappingValue(programId, mappingName, key) {
  let url = `/program/${programId}/mapping/${mappingName}/${key}`
  return aQuery(url)
}

/**
 * Fetch the latest block height
 */
async function getLatestHeight() {
  return aQuery(`/latest/height`)
}

/**
 * Get block by height
 */
async function getBlock(height) {
  return aQuery(`/block/${height}`)
}

async function sumTokens({ balances = {}, owners = [], api }) {
  // Aleo's native token is mapped in credits.aleo -> account
  for (const owner of owners) {
    try {
      // The API returns the value as a string, e.g. "1000000u64"
      const res = await getProgramMappingValue('credits.aleo', 'account', owner)
      if (res) {
        // Strip the "u64" or other type suffixes
        const amountStr = res.replace(/u64$/, '')
        const amount = Number(amountStr) / 1e6 // Convert microcredits to Aleo
        
        if (api) {
          api.addCGToken('aleo', amount)
        } else {
          sdk.util.sumSingleBalance(balances, 'coingecko:aleo', amount)
        }
      }
    } catch (e) {
      // mapping might return 404 or null if no balance
    }
  }
  return balances
}

module.exports = {
  endpoint,
  aQuery,
  getProgramMappingValue,
  getLatestHeight,
  getBlock,
  sumTokens,
}
