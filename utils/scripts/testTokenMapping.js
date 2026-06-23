const { default: PromisePool } = require('@supercharge/promise-pool/dist')
const { default: axios } = require('axios')
const mapping = require('../../../server/coins/src/adapters/tokenMapping.json')
const { sliceIntoChunks } = require('../../projects/helper/utils')

const tokens = Object.entries(mapping).map(i => {
  const [chain, obj] = i
  return Object.keys(obj).map(j => chain+':'+j)
}).flat()

async function main() {
  console.log('token count:', tokens.length)
  const missing = []
  const chunks = sliceIntoChunks(tokens, 50)
  
  await PromisePool
    .withConcurrency(5)
    .for(chunks)
    .process(async chunk => {
      const str = chunk.join(',')
      const { data } = await axios.get('https://coins2.llama.fi/prices/current/'+str)
      missing.push(...chunk.filter(i => !data.coins[i]))
    })

   console.log(missing, missing.length)

} 

main()