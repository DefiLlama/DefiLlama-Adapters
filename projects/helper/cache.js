const sdk = require('@defillama/sdk')
const crypto = require('crypto')
const Bucket = "tvl-adapter-cache";
const graphql = require('./utils/graphql')
const { get: httpGet, post: httpPost, withRetry } = require('./http')

// Hash of the request shape (endpoint + body/variables). Used to disambiguate the in-memory
// promise cache when multiple call sites share a `project` name but hit different endpoints.
// Disk cache keys remain project-only so existing fallback semantics are preserved.
function _requestHash(...parts) {
  const h = crypto.createHash('md5')
  for (const p of parts) {
    if (p == null) continue
    h.update(typeof p === 'string' ? p : JSON.stringify(p))
    h.update('\0')
  }
  return h.digest('hex').slice(0, 12)
}

function getKey(project, chain) {
  return `cache/${project}/${chain}.json`
}

function getFileKey(project, chain) {
  return `${Bucket}/${getKey(project, chain)}`
}

function getLink(project, chain) {
  return `https://${Bucket}.s3.eu-central-1.amazonaws.com/${getKey(project, chain)}`
}

async function getCache(project, chain, { skipCompression } = {}) {
  const Key = getKey(project, chain)
  const fileKey = getFileKey(project, chain)

  try {
    const json = await sdk.cache.readCache(fileKey, { skipCompression })
    if (!json || Object.keys(json).length === 0) throw new Error('Invalid data')
    return json
  } catch (e) {
    try {
      const json = await httpGet(getLink(project, chain))
      await sdk.cache.writeCache(fileKey, json)
      return json
    } catch (e) {
      sdk.log('failed to fetch data from s3 bucket:', Key)
      // sdk.log(e)
      return {}
    }
  }
}

async function setCache(project, chain, cache, { skipCompression } = {}) {
  const Key = getKey(project, chain)

  try {
    await sdk.cache.writeCache(getFileKey(project, chain), cache, {
      skipCompression,
    })
  } catch (e) {
    sdk.log('failed to write data to s3 bucket: ', Key)
    sdk.log(e)
  }
}

const configCache = {}
let lastCacheReset = Date.now()
const cacheResetInterval = 1000 * 30 // 30 seconds

function resetCache() {
  if (Date.now() - lastCacheReset > cacheResetInterval) {
    Object.keys(configCache).forEach(key => delete configCache[key])
    lastCacheReset = Date.now()
  }
}

function _isValidCachePayload(json) {
  if (json == null) return false
  if (json?.error?.message) return false
  if (typeof json === 'string') {
    const s = json.trim()
    if (!s) return false
    if (s.length > 42) {
      try { JSON.parse(s) } catch { return false }
    }
    return true
  }  
  if (Array.isArray(json)) return json.length > 0
  if (typeof json === 'object') return Object.keys(json).length > 0
  return false
}

async function _setCache(project, chain, json) {
  // Don't overwrite a good cache with empty/error payloads — but unlike the old length>42 heuristic,
  // small-but-valid configs (e.g. {"a":1}) are now correctly persisted.
  if (!_isValidCachePayload(json)) return
  await setCache(project, chain, json)
}

async function getConfig(project, endpoint, { fetcher } = {}) {
  resetCache()
  if (!project || (!endpoint && !fetcher)) throw new Error('Missing parameters')
  const key = 'config-cache'
  const cacheKey = getKey(key, project) + '#' + _requestHash(endpoint, fetcher && fetcher.toString())
  if (!configCache[cacheKey]) {
    const promise = _getConfig()
    promise.catch(() => { if (configCache[cacheKey] === promise) delete configCache[cacheKey] })
    configCache[cacheKey] = promise
  }
  return configCache[cacheKey]

  async function _getConfig() {
    try {
      let json
      if (endpoint) {
        json = await httpGet(endpoint)
      } else {
        json = await fetcher()
      }
      if (!json) throw new Error('Invalid data')


      // check if the the response is a proper json, if not we might have an endpoint issue and we should keep the old cache instead of overwriting it with bad data
      try {
        if (typeof json === 'string') {
          let parsedJson = JSON.parse(json)
        }
      } catch (e) {
        // not json, maybe csv or something else, we just cache it as is
        const currentCache = await getCache(project, key)
        if (typeof currentCache !== 'string' && Object.keys(currentCache).length > 0) {
          sdk.log(project, 'fetched non-json config, but we have valid json cache, so we keep the old cache')
          throw new Error('Fetched non-json config, but we have valid json cache, so we keep the old cache: '+ projects)
        }
      }
      
      await _setCache(key, project, json)
      return json
    
    
    } catch (e) {
      // sdk.log(e)
      sdk.log(project, 'tryng to fetch from cache, failed to fetch data from endpoint:', endpoint)
      return getCache(key, project)
    }
  }
}

async function configPost(project, endpoint, data) {
  if (!project || !endpoint) throw new Error('Missing parameters')
  const key = 'config-cache'
  const cacheKey = getKey(key, project) + '#' + _requestHash(endpoint, data)
  if (!configCache[cacheKey]) {
    const promise = _configPost()
    promise.catch(() => { if (configCache[cacheKey] === promise) delete configCache[cacheKey] })
    configCache[cacheKey] = promise
  }
  return configCache[cacheKey]

  async function _configPost() {
    try {
      const json = await httpPost(endpoint, data)
      await _setCache(key, project, json)
      return json
    } catch (e) {
      // sdk.log(e)
      sdk.log(project, 'tryng to fetch from cache, failed to fetch data from endpoint:', endpoint)
      return getCache(key, project)
    }
  }
}


async function cachedGraphQuery(project, endpoint, query, { api, useBlock = false, variables = {}, fetchById, safeBlockLimit, headers, } = {}) {
  if (!project || !endpoint) throw new Error('Missing parameters')
  endpoint = sdk.graph.modifyEndpoint(endpoint)
  const key = 'config-cache'
  const cacheKey = getKey(key, project) + '#' + _requestHash(endpoint, query, variables, !!fetchById)
  if (!configCache[cacheKey]) {
    const promise = _cachedGraphQuery()
    promise.catch(() => { if (configCache[cacheKey] === promise) delete configCache[cacheKey] })
    configCache[cacheKey] = promise
  }
  return configCache[cacheKey]

  async function _cachedGraphQuery() {
    try {
      let json
      if (useBlock && !variables.block && !fetchById) {
        if (!api) throw new Error('Missing parameters')
        variables.block = await api.getBlock()
      }
      if (!fetchById)
        json = await withRetry(() => graphql.request(endpoint, query, { variables, headers }))
      else
        json = await graphFetchById({ endpoint, query, params: variables, api, options: { useBlock, safeBlockLimit, headers } })
      if (!json) throw new Error('Empty JSON')
      await _setCache(key, project, json)
      return json
    } catch (e) {
      // sdk.log(e)
      sdk.log(project, 'trying to fetch from cache, failed to fetch data from endpoint:', endpoint)
      return getCache(key, project)
    }
  }
}


async function graphFetchById({ endpoint, query, params = {}, api, options: { useBlock = false, safeBlockLimit = 500, headers } = {} }) {
  if (useBlock && !params.block)
    params.block = await api.getBlock() - safeBlockLimit
  endpoint = sdk.graph.modifyEndpoint(endpoint)

  let data = []
  let lastId = ""
  let response;
  do {
    const res = await withRetry(() => graphql.request(endpoint, query, { variables: { ...params, lastId }, headers }))
    Object.keys(res).forEach(key => response = res[key])
    data.push(...response)
    lastId = response[response.length - 1]?.id
    sdk.log(data.length, response.length)
  } while (lastId)
  return data
}


module.exports = {
  getCache, setCache, getConfig, configPost, cachedGraphQuery, graphFetchById,
}