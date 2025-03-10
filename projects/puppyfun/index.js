const axios = require('axios')

const BNB_ADDRESS = '0x0000000000000000000000000000000000000000'

const apiBaseURL = 'https://bd-fun-defilama-ts-backend-main.puppy.fun/lama-api'
const tvlMethod = '/tvl'

const maxRetriesCount = 3

module.exports = {
  // TODO description
  methodology: "TVL calculated from PuppyFun contracts.",
  bsc: {
    tvl,
  },
}

async function tvl(api) {
  const queryURL = apiBaseURL + tvlMethod

  for (let tryCount = 0; tryCount < maxRetriesCount; ++tryCount) {
    try {
      console.log(`Query TVL ...`)
      const response = await axios.get(queryURL)
      console.log(`Got response: tvlDirty: ${response.data.tvlDirty / 10 ** 18} BNB | tvlClean ${response.data.tvlClean / 10 ** 18} BNB`)
      api.add(BNB_ADDRESS, response.data.tvlClean)
      break
    } catch(err) {
      console.log(`Error getting TVL`, err)
      continue
    }
  }
}
