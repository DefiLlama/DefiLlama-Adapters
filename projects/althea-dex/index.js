const { getConfig } = require("../helper/cache")
const { get } = require("../helper/http")
const { sumTokens2 } = require("../helper/unwrapLPs")

async function tvl(api) {
  const config =  await getConfig('althea-pools',undefined, {
    fetcher: async () =>  {
      const data = await get('https://althea.link:8443/lp_page_data')
      return data.pools
    }
  } )
  const tokens = config.map(i=> [i.base.address, i.quote.address]).flat()
  return sumTokens2({ api, tokens, owner: '0xd263DC98dEc57828e26F69bA8687281BA5D052E0'})

}


module.exports = {
  althea: { tvl }
}