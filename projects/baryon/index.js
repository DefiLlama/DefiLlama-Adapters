const utils = require('../helper/utils');
const { stakings, staking } = require('../helper/staking');
const { getUniTVL } = require('../helper/unknownTokens')
const { getConfig } = require('../helper/cache')

async function fetchData(chain) {
  const data = await getConfig('baryon/staking', 'https://rapid.coin98.com/baryon-stake.json')

  return data[chain]
}

async function stakingTomo(...args) {
  const lpTokenTomo = await fetchData('tomo')

  return stakings(lpTokenTomo.stakeContract, lpTokenTomo.lpToken)(...args)
}

async function stakingBsc(...args) {
  const lpTokenTomo = await fetchData('binanceSmart')

  return stakings(lpTokenTomo.stakeContract, lpTokenTomo.lpToken)(...args)
}

module.exports = {
  bsc: {
    misrepresentedTokens: true,
    staking: stakingBsc,
    tvl: getUniTVL({
      factory: '0x03879e2a3944fd601e7638dfcbc9253fb793b599',
      useDefaultCoreAssets: true,
    })
  },
  tomochain: {
    misrepresentedTokens: true,
    staking: stakingTomo,
    tvl: getUniTVL({
      factory: '0xFe48A2E66EE2f90334d3565E56E0c9d0081447e8',
      useDefaultCoreAssets: true,
    })
  }
}