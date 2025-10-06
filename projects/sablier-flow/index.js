const { isWhitelistedToken } = require('../helper/streamingHelper')
const { request } = require("graphql-request");
const sdk = require("@defillama/sdk");

const config = {
  ethereum: 'ECxBJhKceBGaVvK6vqmK3VQAncKwPeAQutEb8TeiUiod',
  abstract: 'Gq3e1gihMoSynURwGXQnPoKGVZzdsyomdrMH934vQHuG',
  arbitrum: 'C3kBBUVtW2rxqGpAgSgEuSaT49izkH6Q8UibRt7XFTyW',
  avax: '6PAizjTALVqLLB7Ycq6XnpTeck8Z8QUpDFnVznMnisUh',
  base: '4XSxXh8ZgkzaA35nrbQG9Ry3FYz3ZFD8QBdWwVg5pF9W',
  berachain: 'J87eaBLfTe7kKWgUGqe5TxntNCzA4pyWmqJowMddehuh',
  blast: '8joiC9LpUbSV6eGRr3RWXDArM8p9Q65FKiFekAakkyia',
  bsc: '2vU8KF4yWh3vvFjtg7MrRXMnYF3hPX2T3cvVBdaiXhNb',
  chz: '7QX7tJsANNFpxFLLjqzmXRzfY1wPGp3Lty5xGbhgADa6',
  xdai: '4KiJ53cTNKdFWPBPmDNQ55tYj8hn1WQg8R4UcTY2STLL',
  iotex: '6No3QmRiC8HXLEerDFoBpF47jUPRjhntmv28HHEMxcA2',
  linea: 'DV9XgcCCPKzUn6pgetg4yPetpW2fNoRKBUQC43aNeLG6',
  mode: '9TwfoUZoxYUyxzDgspCPyxW6uMUKetWQDaTGsZjY1qJZ',
  optimism: 'AygPgsehNGSB4K7DYYtvBPhTpEiU4dCu3nt95bh9FhRf',
  polygon: 'ykp38sLarwz3cpmjSSPqo7UuTjYtkZ1KiL4PM2qwmT8',
  scroll: 'HFpTrPzJyrHKWZ9ebb4VFRQSxRwpepyfz5wd138daFkF',
  sei: '41ZGYcFgL2N7L5ng78S4sD6NHDNYEYcNFxnz4T8Zh3iU',
  sonic: 'HkQKZKuM6dZ7Vc4FGC1gZTVVTniYJWRhTRmDDMNzN8zk',
  unichain: 'Cb5uDYfy4ukN9fjhQ3PQZgDzyo6G66ztn1e847rS7Xa8',
  era: '9DRgWhDAMovpkej3eT8izum6jxEKHE62ciArffsTAScx',
}

const payload = `
{
  contracts { id address }
  assets { id chainId symbol }
}
`

async function getTokensConfig(api, isVesting) {
  const endpoint = config[api.chain]
  if (!endpoint) return { ownerTokens: [] }
  const url = sdk.graph.modifyEndpoint(endpoint)
  const { contracts, assets } = await request(url, payload)
  const owners = contracts.map(i => i.address)

  const tokens = assets
    .filter(asset => isWhitelistedToken(asset.symbol, asset.id, isVesting))
    .map(asset => asset.id.split('-').slice(2)[0])
  
  const ownerTokens = owners.map(owner => [tokens, owner])
  return { ownerTokens }
}

async function tvl(api) {
  return api.sumTokens(await getTokensConfig(api, false))
}

async function vesting(api) {
  return api.sumTokens(await getTokensConfig(api, true))
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, vesting }
})
