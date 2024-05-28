const { sumTokens2 } = require('../helper/unwrapLPs');


const farms = [
  {
    address: '0xE22da09d0B847291076bF5691a9D3908eB8CbAFe',
    token: '0xE4E55C9203Ac398A0F0B98BD096B70D9778eCa6A',
  },
  {
    address: '0xF01f44B1b5770d3c5dc54FE1455786d1227736CC',
    token: '0x910651F81a605a6Ef35d05527d24A72fecef8bF0',
  },
  {
    address: '0x5b0F4cb9041cED035Fd0a7Db3c0C2f7f4dC62A66',
    token: '0xD9baBF51f327829264f554B4Fa4e12Cec5BD0F50',
  },
]

async function tvl(api) {
  const tokens = farms.map(farm => farm.token)
  const addresses = farms.map(farm => farm.address)
  const bals = await api.multiCall({  abi: 'erc20:totalSupply', calls: addresses})
  api.addTokens(tokens, bals) 
  return sumTokens2({api, resolveLP: true})
}

module.exports = {
  heco: {
    tvl,
  },
}