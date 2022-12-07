const path = require('path')
const fs = require('fs')
const aws = require('aws-sdk')

const cacheFolder = process.env.CACHE_FOLDER || path.join(__dirname + '../../../../cache')

async function getCache(project, chain) {
  const file = path.join(cacheFolder, `${project}-${chain}.json`)
  if (fs.existsSync(file))
    return JSON.parse(fs.readFileSync(file))
  return {}
}

async function setCache(project, chain, cache) {
  const file = path.join(cacheFolder, `${project}-${chain}.json`)
  fs.writeFileSync(file, JSON.stringify(cache))
}

module.exports = {
  getCache, setCache,
}