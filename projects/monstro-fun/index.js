const { sumTokensExport } = require('../helper/unwrapLPs')

const MONSTRO = '0x1d3bE1CC80cA89DDbabe5b5C254AF63200e708f7'
const STAKING_CONTRACT = '0x99741758A3BCD7A95B80845E124C5C499DF4742b'

async function stakingTvl(api) {
  const totalStaked = await api.call({
    target: STAKING_CONTRACT,
    abi: 'function totalStaked() view returns (uint256)',
  })
  api.add(MONSTRO, totalStaked)
}

module.exports = {
  methodology: 'Staking counts MONSTRO tokens staked by users via totalStaked(), excluding unreleased emissions.',
  hallmarks: [
    ['2026-01-21', 'Legacy contracts deprecated'],
    ['2026-02-01', 'DAO launch with staking'],
  ],
  base: {
    tvl: () => ({}),
    staking: stakingTvl,
  },
}