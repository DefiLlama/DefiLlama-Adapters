const { sumTokens, } = require('../helper/chain/cosmos')

module.exports = {
  kujira: {
    tvl: async () => {
      return sumTokens({ owners: ['kujira1e6fjnq7q20sh9cca76wdkfg69esha5zn53jjewrtjgm4nktk824stzyysu'], chain: 'kujira' })
    },
  },
  osmosis: {
    tvl: async () => {
      return sumTokens({ owners: ['osmo1zacxlu90sl6j2zf90uctpddhfmux84ryrw794ywnlcwx2zeh5a4q67qtc9'], chain: 'osmosis' })
    }
  },
  neutron: {
    tvl: async () => {
      return sumTokens({ owners: ['neutron1cc5adah6vekm2nz5yp6qs332g704q90jgc03v8zxpzaqh297jvqqae2eez'], chain: 'neutron' })
    }
  },
  archway: {
    tvl: async () => {
      return sumTokens({ owners: ['archway1delmknshmvfuhv07uetes90crzrj32za23pgd9cvjtc5mrzfjauq3jqrpa'], chain: 'archway' })
    }
  },
}
