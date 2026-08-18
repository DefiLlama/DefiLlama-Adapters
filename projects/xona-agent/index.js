const { sumTokensExport } = require('../helper/solana')

// $XONA staking runs on Streamflow's stake-pool program. Each lock tier is its
// own stake pool, and every pool holds the staked $XONA in a dedicated vault
// token account. Summing those four vaults gives the total amount staked.
//
// Pool -> vault:
//   7d   8Decw6QqPQedPk9wc6WDEbbwCJYhVRcW56Ctju7F4pJF -> Ci3CwCoZoSuKAD1h7AcfnnSR32gE5rBw1jgysGpqXZAv
//   30d  CARFKPj4DbXCcC2LoQP6Q7z8BP4v1yuLPY1oaWRaUCcs -> EJU9GprW3U4DpxzhEKNtSnBK4gsGCg7RD9sdH8Nej8Kh
//   90d  3fSNKW4L8EocGk3DPvNNYcn3jRHwBoKzFbAnUhzaNbxP -> FatAxEievkavRn7EEuyLkgk6NMEUFpigRxpeyHatYyMD
//   180d 2V8WTgdNAe8fYGWYe2nBtr9scuAtxqBzUjbaUVAv7vHU -> 9xRfz54N76qfRGcyBk8ZBvKbbD6pYs9dXfUPvM8CgDms
const stakeVaults = [
  'Ci3CwCoZoSuKAD1h7AcfnnSR32gE5rBw1jgysGpqXZAv', // 7 day tier
  'EJU9GprW3U4DpxzhEKNtSnBK4gsGCg7RD9sdH8Nej8Kh', // 30 day tier
  'FatAxEievkavRn7EEuyLkgk6NMEUFpigRxpeyHatYyMD', // 90 day tier
  '9xRfz54N76qfRGcyBk8ZBvKbbD6pYs9dXfUPvM8CgDms', // 180 day tier
]

module.exports = {
  timetravel: false,
  methodology:
    'Counts $XONA locked in the four Xona Agent staking tiers (7, 30, 90 and 180 days). Each tier is a Streamflow stake pool; the amount staked is read on-chain from each pool vault token account. Reported under staking since only the protocol native token is deposited. Reward vaults are not counted, as those tokens are not user deposits.',
  solana: {
    tvl: () => ({}),
    staking: sumTokensExport({ tokenAccounts: stakeVaults }),
  },
}
