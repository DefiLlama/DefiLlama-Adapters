const { sumTokens2 } = require("../helper/solana");

async function tvl() {
  const collateralVaultAuthority = 'HZYHFagpyCqXuQjrSCN2jWrMHTVHPf9VWP79UGyvo95L'
  const psmVaultAuthority = '8WrqMitrgjzfqaPJ5PK6X3VT6B1Z8rDgQQny2aWwvJ8q'
  return sumTokens2({ owners: [collateralVaultAuthority, psmVaultAuthority] })
}

async function staking() {
  const hbbStakingPoolTokenAndOwner = [
    'HBB111SCo9jkCejsZfz8Ec8nH7T6THF8KEKSnvwT6XK6',
    'GbjqYShCb3LeyXuxkjLBGcmrWakqePPpMoHraQJcTtJJ'
  ]

  const tokensAndOwners = [hbbStakingPoolTokenAndOwner]
  return sumTokens2({ tokensAndOwners, })
}

module.exports = {
  timetravel: false,
  solana: { tvl, staking, },
};
