const { stakings } = require('../helper/staking');
const { getUniTVL } = require('../helper/unknownTokens')
const { getConfig } = require('../helper/cache')

async function fetchData(chain) {
  const data = await getConfig('baryon/staking', 'https://rapid.coin98.com/baryon-stake.json')

  return data[chain]
}

const config = {
  bitkub: { factory: '0xf7eEe3A8363731C611A24CdDfCBcaDE9C153Cfe8', key: 'bitkub' },
  ancient8: { factory: '0xAE12C5930881c53715B369ceC7606B70d8EB229f', key: 'ancient8Mainnet' },
  tomochain: { factory: '0xFe48A2E66EE2f90334d3565E56E0c9d0081447e8', key: 'tomo' },
  bsc: { factory: '0x03879e2a3944fd601e7638dfcbc9253fb793b599', key: 'binanceSmart' },
}

Object.keys(config).forEach(chain => {
  const { factory, key } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true }),
    staking: async (...args) => {
      let { stakeContract, lpToken } = await fetchData(key)

      if (chain === 'tomochain') {
        // this is not staking contract on tomochain
        stakeContract = stakeContract.filter(item => String(item).toLowerCase() !== '0x0afdbe5989cab06e66244cc2583f0caeecb6ea8e')
      }

      return stakings(stakeContract, lpToken)(...args)
    }
  }
})

module.exports.misrepresentedTokens = true