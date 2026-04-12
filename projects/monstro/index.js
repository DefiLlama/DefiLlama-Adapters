const { sumTokensExport } = require('../helper/unwrapLPs')

const MONSTRO = '0x1d3bE1CC80cA89DDbabe5b5C254AF63200e708f7'
const STAKING_CONTRACT = '0x99741758A3BCD7A95B80845E124C5C499DF4742b'

const DAO_WALLETS = [
  '0x4713b3ab36C9759043694757E6Cb8123915a8dd0',
  '0xA6Cd9800EfF0994B3f64c330de4E55925d5404DC',
  '0xCb7c195De077B9CADBC5c086Ba7932149B9f4391',
  '0xce45B2ae92c9dc7E39EbB9d9dB6920897A6F6b4a',
]

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
    ['2024-12-21', 'BSC to Base ecosystem migration'],
    ['2025-02-01', 'DAO launch with staking'],
  ],
  base: {
    tvl: () => ({}),
    staking: stakingTvl,
    ownTokens: sumTokensExport({ owners: DAO_WALLETS, tokens: [MONSTRO] }),
  },
}
