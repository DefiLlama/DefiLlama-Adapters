const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')

const url = 'https://api.marinade.finance/tlv'

// Moved out of registries/solanaStakePool.js since getProgramAccounts was failing due to number of stakeAccounts,
// temporarily relying on the marinade api until we can resolve on-chain.
// 'marinade-native': {
//   solana: { type: 'staked', address: 'stWirqFCf2Uts1JBL1Jsd3r6VBWhgnpdPxCTe1MFjrq' },
// },
async function tvl(api) {
  const data = await get(url)
  if(!data.marinade_native_stake_sol) throw 'Marinade API invalid data'
  api.add(ADDRESSES.solana.SOL, data.marinade_native_stake_sol * 1e9)
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology:
    'Counts total SOL staked through Marinade Native.',
}
