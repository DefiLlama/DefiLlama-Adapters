const BV7X = '0x459476869aF797Eb9061B41fA04dE46A60FBeDBD'
const STAKING_POOL = '0x900f4cE2AD056F326BbCF2B5842c75BDf3732cf9'

async function staking(api) {
  const staked = await api.call({ abi: 'uint256:totalSupply', target: STAKING_POOL })
  api.add(BV7X, staked)
}

module.exports = {
  methodology: "Staking counts BV7X staked in the BV-7X MultiRewards staking pool on Robinhood Chain, read as the pool's totalSupply (staked principal only; BV7X held in the pool as reward inventory is excluded). BV7X is the protocol's own token, so it is reported under staking, not TVL.",
  start: '2026-09-14', // deploy block 63,013,994
  robinhood: {
    tvl: () => ({}),
    staking,
  },
}
