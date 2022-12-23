const aws = require('aws-sdk')
const sdk = require('@defillama/sdk')
const Bucket = "tvl-adapter-cache";
const axios = require('axios')

function getKey(project, chain) {
  return `cache/${project}/${chain}.json`
}

function getLink(project, chain) {
  return `https://${Bucket}.s3.eu-central-1.amazonaws.com/${getKey(project, chain)}`
}

async function getCache(project, chain, { } = {}) {
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

module.exports = {
  getCache, setCache,
}