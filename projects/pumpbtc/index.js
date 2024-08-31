const { lock } = require('ethers')
const ADDRESSES = require('../helper/coreAssets.json')
const { default: axios } = require('axios')

module.exports = {
  methodology: 'TVL for pumpBTC is calculated based on the total value of WBTC, FBTC staked in the contract that were utilized in the minting process of pumpBTC.',
}
const config = {
  ethereum: { token: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  bsc: { token: '0xC96dE26018A54D51c097160568752c4E3BD6C364', },
  mantle: { token: '0xC96dE26018A54D51c097160568752c4E3BD6C364', },
}

Object.keys(config).forEach(chain => {
  const { token, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      let stakedAmount = 0
      let queryId = ''

      if (chain === 'ethereum') {
        queryId = '3912607'
      } else if (chain === 'bsc') {
        queryId = '3911272'
      } else {
        queryId = '3947155'
      }

      try {
        const res = await axios.get(`https://api.dune.com/api/v1/query/${queryId}/results?limit=1000`, {headers: {
          'X-Dune-API-Key': 'ajYucyUuEIM3VCMRjUN2wyBAIXdYOUhK'
        }})

        stakedAmount = res.data.result.rows[0].total || 0
      } catch (e) {
        console.log('error:', e)
      }

      api.add(token, stakedAmount * 1e8)
    }
  }
})
