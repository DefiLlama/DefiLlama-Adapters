const sdk = require('@defillama/sdk')
const Bucket = "tvl-adapter-cache";
const axios = require('axios')
const graphql = require('./utils/graphql')

function getKey(project, chain) {
  return `cache/${project}/${chain}.json`
}

function getFileKey(project, chain) {
  return `${Bucket}/${getKey(project, chain)}`
}

function getLink(project, chain) {
  return `https://${Bucket}.s3.eu-central-1.amazonaws.com/${getKey(project, chain)}`
}

async function getCache(project, chain, { _ } = {}) {
  const Key = getKey(project, chain)
  const fileKey = getFileKey(project, chain)

  try {
    const json = await sdk.cache.readCache(fileKey)
    if (!json || Object.keys(json).length === 0) throw new Error('Invalid data')
    return json
  } catch (e) {
    try {
      const { data: json } = await axios.get(getLink(project, chain))
      await sdk.cache.writeCache(fileKey, json)
      return json
    } catch (e) {
      sdk.log('failed to fetch data from s3 bucket:', Key)
      // sdk.log(e)
      return {}
    }
  }
}

async function setCache(project, chain, cache) {
  const Key = getKey(project, chain)

  try {
    await sdk.cache.writeCache(getFileKey(project, chain), cache)
  } catch (e) {
    sdk.log('failed to write data to s3 bucket: ', Key)
    sdk.log(e)
  }
}

const configCache = {}

async function _setCache(project, chain, json) {
  if (!json || json?.error?.message) return;
  const strData = typeof json === 'string' ? json : JSON.stringify(json)
  let isValidData = strData.length > 42
  if (isValidData) // sometimes we get bad data/empty object, we dont overwrite cache with it
    await setCache(project, chain, json)
}

async function getConfig(project, endpoint, { fetcher } = {}) {
  if (!project || (!endpoint && !fetcher)) throw new Error('Missing parameters')
  const key = 'config-cache'
  const cacheKey = getKey(key, project)
  if (!configCache[cacheKey]) configCache[cacheKey] = _getConfig()
  return configCache[cacheKey]

  async function _getConfig() {
    try {
      let json
      if (endpoint) {
        json = (await axios.get(endpoint)).data
      } else {
        json = await fetcher()
      }
      if (!json) throw new Error('Invalid data')
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
  const cacheKey = getKey(key, project)
  if (!configCache[cacheKey]) configCache[cacheKey] = _configPost()
  return configCache[cacheKey]

  async function _configPost() {
    try {
      const { data: json } = await axios.post(endpoint, data)
      await _setCache(key, project, json)
      return json
    } catch (e) {
      // sdk.log(e)
      sdk.log(project, 'tryng to fetch from cache, failed to fetch data from endpoint:', endpoint)
      return getCache(key, project)
    }
  }
}


async function cachedGraphQuery(project, endpoint, query, { api, useBlock = false, variables = {}, fetchById, safeBlockLimit, } = {}) {
  if (!project || !endpoint) throw new Error('Missing parameters')
  endpoint = sdk.graph.modifyEndpoint(endpoint)
  const key = 'config-cache'
  const cacheKey = getKey(key, project)
  if (!configCache[cacheKey]) configCache[cacheKey] = _cachedGraphQuery()
  return configCache[cacheKey]

  async function _cachedGraphQuery() {
    try {
      let json
      if (useBlock && !variables.block  && !fetchById) {
        if (!api) throw new Error('Missing parameters')
        variables.block = await api.getBlock()
      }
      if (!fetchById)
        json = await graphql.request(endpoint, query, { variables })
      else 
        json = await graphFetchById({ endpoint, query, params: variables, api, options: { useBlock, safeBlockLimit } })
      if (!json) throw new Error('Empty JSON')
      await _setCache(key, project, json)
      return json
    } catch (e) {
      // sdk.log(e)
      sdk.log(project, 'tryng to fetch from cache, failed to fetch data from endpoint:', endpoint)
      return getCache(key, project)
    }
  }
}


async function graphFetchById({  endpoint, query, params = {}, api, options: { useBlock = false, safeBlockLimit = 500 } = {} }) {
  if (useBlock && !params.block)
    params.block = await api.getBlock() - safeBlockLimit
  endpoint = sdk.graph.modifyEndpoint(endpoint)

  let data = []
  let lastId = ""
  let response;
  do {
    const res = await graphql.request(endpoint, query, { variables: { ...params, lastId }})
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