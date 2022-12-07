const aws = require('aws-sdk')
const sdk = require('@defillama/sdk')
const Bucket = "tvl-adapter-cache";

function getKey(project, chain) {
  return `cache/${project}-${chain}.json`
}

async function getCache(project, chain, { } = {}) {
  const Key = getKey(project, chain)

  try {
    const data = await new aws.S3()
      .getObject({
        Bucket, Key,
      }).promise();
    const json = data.Body?.toString() ?? "{}"
    return JSON.parse(json)
  } catch (e) {
    sdk.log('failed to fetch data from s3 bucket:', Key)
    sdk.log(e)
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
    sdk.log(e)
  }
}

module.exports = {
  getCache, setCache,
}