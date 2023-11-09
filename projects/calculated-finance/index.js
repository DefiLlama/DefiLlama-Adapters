const { sumTokens, } = require('../helper/chain/cosmos')

async function tvl() {
  const owners = [
    "kujira1e6fjnq7q20sh9cca76wdkfg69esha5zn53jjewrtjgm4nktk824stzyysu",
  ]
  return sumTokens({ owners, chain: 'kujira' })
}

module.exports = {
  kujira: {
    tvl,
  },
  osmosis: {
    tvl: async () => {
      return sumTokens({ owners: ['osmo1zacxlu90sl6j2zf90uctpddhfmux84ryrw794ywnlcwx2zeh5a4q67qtc9'], chain: 'osmosis' })
    }
  },
}