const { stakings } = require('../helper/staking');
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

async function stakingAncient8(...args) {
  const lpTokenqAncient8 = await fetchData('ancient8Mainnet')

  return stakings(lpTokenqAncient8.stakeContract, lpTokenqAncient8.lpToken)(...args)
}

async function stakingBitkub(...args) {
  const lpTokenBitkub = await fetchData('bitkub')

  return stakings(lpTokenBitkub.stakeContract, lpTokenBitkub.lpToken)(...args)
}


module.exports = {
  bsc: {
    staking: stakingBsc,
    tvl: getUniTVL({
      factory: '0x03879e2a3944fd601e7638dfcbc9253fb793b599',
    })
  },
  tomochain: {
    staking: stakingTomo,
    tvl: getUniTVL({
      factory: '0xFe48A2E66EE2f90334d3565E56E0c9d0081447e8',
    })
  },
  ancient8: {
    staking: stakingAncient8,
    tvl: getUniTVL({
      factory: '0xAE12C5930881c53715B369ceC7606B70d8EB229f',
    })
  },
  bitkub: {
    staking: stakingBitkub,
    tvl: getUniTVL({
      factory: '0xf7eEe3A8363731C611A24CdDfCBcaDE9C153Cfe8',
    })
  }
}