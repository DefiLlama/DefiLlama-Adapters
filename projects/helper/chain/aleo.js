const axios = require('axios')

const endpoint = 'https://api.provable.com/v1/mainnet'

async function aQuery(path) {
  const { data } = await axios.get(`${endpoint}${path}`, { timeout: 10000 })
  return data
}

/**
 * Fetch a value from a mapping within an Aleo program.
 * Program ids are auto-resolved to their addresses by the API, so either a
 * program id (e.g. 'delegator1.aleo') or an aleo1... address works as the key.
 * Returns the raw value (a string such as "1000000u64", or a struct string for
 * composite values like `bonded`), or null when there is no entry for the key.
 * e.g. getProgramMappingValue('credits.aleo', 'account', 'aleo1...')
 */
async function getProgramMappingValue(programId, mappingName, key) {
  return aQuery(`/program/${programId}/mapping/${mappingName}/${key}`)
}

module.exports = {
  getProgramMappingValue,
}
