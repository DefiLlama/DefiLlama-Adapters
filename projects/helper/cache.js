const aws = require('aws-sdk')
const sdk = require('@defillama/sdk')
const Bucket = "tvl-adapter-cache";
const axios = require('axios')
const graphql = require('./utils/graphql')

function getKey(project, chain) {
  return `cache/${project}/${chain}.json`
}

function getLink(project, chain) {
  return `https://${Bucket}.s3.eu-central-1.amazonaws.com/${getKey(project, chain)}`
}

async function getCache(project, chain, { _ } = {}) {
  const Key = getKey(project, chain)

  try {
    const { data: json } = await axios.get(getLink(project, chain))
    return json
  } catch (e) {
    sdk.log('failed to fetch data from s3 bucket:', Key)
    // sdk.log(e)
    return {}
  }
}

async function setCache(project, chain, cache, {
  ContentType = 'application/json',
  ACL = 'public-read'
} = {}) {

  const Key = getKey(project, chain)

  try {
    await new aws.S3()
      .upload({
        Bucket, Key,
        Body: JSON.stringify(cache),
        ACL, ContentType,
      }).promise();

  } catch (e) {
    sdk.log('failed to write data to s3 bucket: ', Key)
    // sdk.log(e)
  }
}

const configCache = {}

async function getConfig(project, endpoint) {
  if (!project || !endpoint) throw new Error('Missing parameters')
  const key = 'config-cache'
  const cacheKey = getKey(key, project)
  if (!configCache[cacheKey]) configCache[cacheKey] = _getConfig()
  return configCache[cacheKey]

  async function _getConfig() {
    try {
      const { data: json } = await axios.get(endpoint)
      await setCache(key, project, json)
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
      await setCache(key, project, json)
      return json
    } catch (e) {
      // sdk.log(e)
      sdk.log(project, 'tryng to fetch from cache, failed to fetch data from endpoint:', endpoint)
      return getCache(key, project)
    }
  }
}


async function cachedGraphQuery(project, endpoint, query, { variables } = {}) {
  if (!project || !endpoint) throw new Error('Missing parameters')
  const key = 'config-cache'
  const cacheKey = getKey(key, project)
  if (!configCache[cacheKey]) configCache[cacheKey] = _cachedGraphQuery()
  return configCache[cacheKey]

  async function _cachedGraphQuery() {
    try {
      const json = await graphql.request(endpoint, query, { variables })
      await setCache(key, project, json)
      return json
    } catch (e) {
      // sdk.log(e)
      sdk.log(project, 'tryng to fetch from cache, failed to fetch data from endpoint:', endpoint)
      return getCache(key, project)
    }
  }
}

module.exports = {
  getCache, setCache, getConfig, configPost, cachedGraphQuery,
}