require('dotenv').config()
const axios = require('axios')
const { getEnv } = require('./env')

function getApiKey() {
  const raw = getEnv('DUNE_API_KEYS') || ''
  const keys = raw.split(',').map(s => s.trim()).filter(Boolean)
  if (!keys.length) throw new Error('Missing DUNE_API_KEYS env (needed to fetch Dune query results)')
  return keys[Math.floor(Math.random() * keys.length)]
}

// Fetch the LATEST cached execution results of a saved Dune query, without re-executing it.
// Paginates through all rows. See https://docs.dune.com/api-reference/executions/endpoint/get-query-result
async function getLatestDuneResults(queryId, { pageSize = 1000 } = {}) {
  const headers = { 'X-Dune-Api-Key': getApiKey() }
  let rows = []
  let offset = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const url = `https://api.dune.com/api/v1/query/${queryId}/results?limit=${pageSize}&offset=${offset}`
    const { data } = await axios.get(url, { headers })
    const batch = (data && data.result && data.result.rows) || []
    rows = rows.concat(batch)
    if (!batch.length || data.next_offset == null) break
    offset = data.next_offset
  }
  return rows
}

const DUNE_API = 'https://api.dune.com/api/v1'
// Passthrough Dune query that takes a `fullQuery` text parameter and runs it as-is,
// letting us execute arbitrary DuneSQL on demand. Same one used by the dimension-adapters repo.
const PASSTHROUGH_QUERY_ID = '3996608'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Execute arbitrary DuneSQL and return the result rows. Submits the query, polls until it
// completes, then fetches the results (always a fresh execution).
async function queryDuneSql(sql, { maxWaitMs = 240000 } = {}) {
  const headers = { 'X-Dune-Api-Key': getApiKey() }

  const { data: submitted } = await axios.post(
    `${DUNE_API}/query/${PASSTHROUGH_QUERY_ID}/execute`,
    { query_parameters: { fullQuery: sql } },
    { headers })
  const executionId = submitted && submitted.execution_id
  if (!executionId) throw new Error('Dune: no execution_id returned')

  const deadline = Date.now() + maxWaitMs
  let state
  do {
    await sleep(2000 + Math.floor(Math.random() * 3000))
    const { data } = await axios.get(`${DUNE_API}/execution/${executionId}/status`, { headers })
    state = data.state
  } while ((state === 'QUERY_STATE_PENDING' || state === 'QUERY_STATE_EXECUTING') && Date.now() < deadline)

  if (state !== 'QUERY_STATE_COMPLETED') throw new Error(`Dune query did not complete (state: ${state})`)

  const { data } = await axios.get(`${DUNE_API}/execution/${executionId}/results?limit=100000`, { headers })
  return (data && data.result && data.result.rows) || []
}

module.exports = {
  getLatestDuneResults,
  queryDuneSql,
}
